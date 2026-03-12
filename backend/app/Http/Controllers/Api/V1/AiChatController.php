<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class AiChatController extends Controller
{
    /**
     * List conversations for the authenticated user.
     */
    public function conversations(Request $request)
    {
        $conversations = ChatConversation::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->take(30)
            ->get(['id', 'title', 'updated_at']);

        return response()->json($conversations);
    }

    /**
     * Get messages for a conversation.
     */
    public function messages(Request $request, ChatConversation $conversation)
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($conversation->messages()->orderBy('id')->get());
    }

    /**
     * Send a message and get AI response.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'conversation_id' => 'nullable|integer|exists:chat_conversations,id',
        ]);

        $user = $request->user();

        // Ensure HR admin
        if (!$user->hasRole('hr_admin')) {
            return response()->json(['message' => 'Only HR administrators can use AI chat.'], 403);
        }

        $apiKey = config('services.openai.key');
        if (empty($apiKey)) {
            return response()->json(['message' => 'OpenAI API key not configured. Add OPENAI_API_KEY to .env'], 500);
        }

        // Get or create conversation
        if ($request->conversation_id) {
            $conversation = ChatConversation::where('id', $request->conversation_id)
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $conversation = ChatConversation::create([
                'user_id' => $user->id,
                'title' => \Illuminate\Support\Str::limit($request->message, 60),
            ]);
        }

        // Save user message
        ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $request->message,
        ]);

        // Build context: recent messages in this conversation
        $recentMessages = $conversation->messages()
            ->orderByDesc('id')
            ->take(10)
            ->get()
            ->reverse()
            ->values()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();

        // Get database schema for RAG context
        $schemaContext = $this->getDatabaseSchema();

   $systemPrompt = <<<PROMPT
You are an HR data assistant. You have NO knowledge of this company's data — you only know the database structure below. You MUST always query the database; never guess, assume, or invent any data.

DATABASE SCHEMA:
{$schemaContext}

━━━ MANDATORY RULE ━━━
EVERY response MUST contain a ```sql ... ``` block. No exceptions.
If you don't include SQL, your answer will be rejected.
NEVER use your own knowledge to answer — ALL facts come from the SQL query result.

━━━ RESPONSE FORMAT ━━━
Write ONE short heading (no numbers, no names, no facts — just the topic).
Then immediately the SQL block. Nothing else.

Good headings: "Employees who joined this month:", "Pending leave requests:", "Department breakdown:"
Bad headings: "You have 11 employees" (contains a fact), "Let me check..." (process language)

━━━ SQL RULES ━━━
- SELECT only (never INSERT/UPDATE/DELETE/DROP/ALTER)
- LIMIT 100 always
- Never select id or user_id — always JOIN users u ON ...user_id = u.id and use u.name
- Use DATE(col) for all date/datetime fields
- Only select columns relevant to the question
- Use the exact table/column names from the schema above
- For "this month": WHERE strftime('%Y-%m', col) = strftime('%Y-%m', 'now')
- For "today": WHERE DATE(col) = DATE('now')

EXAMPLE:
Pending leave requests:
```sql
SELECT u.name, lr.type, DATE(lr.from_date) as from_date, DATE(lr.to_date) as to_date, lr.days
FROM leave_requests lr JOIN users u ON lr.user_id = u.id
WHERE lr.status = 'Pending' LIMIT 100
```
PROMPT;

        $messages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $recentMessages
        );

        try {
            // Call OpenAI
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => $messages,
                'max_tokens' => 1500,
                'temperature' => 0.1,
            ]);

            if (!$response->successful()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['error']['message'] ?? 'OpenAI API error';
                throw new \Exception($errorMessage);
            }

            $aiContent = $response->json('choices.0.message.content') ?? 'Sorry, I could not generate a response.';

            // Extract SQL — if missing, the AI responded without querying the DB (hallucination risk)
            $sqlQuery = null;
            $finalResponse = $aiContent;

            if (!preg_match('/```sql\s*(.*?)\s*```/si', $aiContent)) {
                // AI answered without SQL — refuse to show that response
                $finalResponse = "I can only answer based on your actual HR data. Could you rephrase your question so I can look it up properly?";
            } elseif (preg_match('/```sql\s*(.*?)\s*```/si', $aiContent, $matches)) {
                $sqlQuery = trim($matches[1]);

                // Safety: only allow SELECT
                $normalized = strtoupper(trim($sqlQuery));
                if (str_starts_with($normalized, 'SELECT')) {
                    // Ensure LIMIT exists
                    if (!preg_match('/\bLIMIT\b/i', $sqlQuery)) {
                        $sqlQuery = rtrim($sqlQuery, "; \n\r\t") . ' LIMIT 100';
                    }

                    try {
                        $queryResult = DB::select($sqlQuery);

                        // Build natural-language response via a small focused AI call
                        $finalResponse = $this->buildNaturalResponse(
                            $queryResult, $aiContent, $apiKey
                        );

                    } catch (\Exception $e) {
                        $finalResponse = "I encountered an error while retrieving the data. Please try rephrasing your question.";
                        $sqlQuery = $sqlQuery . ' -- ERROR: ' . $e->getMessage();
                    }
                } else {
                    $finalResponse = "For security reasons, I can only retrieve data, not modify it.";
                    $sqlQuery = null;
                }
            }

            // Save assistant message
            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $finalResponse,
                'sql_query' => $sqlQuery,
            ]);

            $conversation->touch();

            return response()->json([
                'conversation_id' => $conversation->id,
                'message' => $finalResponse,
                'sql_query' => $sqlQuery,
            ]);

        } catch (\Exception $e) {
            $errorReply = "Sorry, I encountered an error: " . $e->getMessage();

            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $errorReply,
            ]);

            return response()->json([
                'conversation_id' => $conversation->id,
                'message' => $errorReply,
            ], 500);
        }
    }

    /**
     * Get the database schema as a string for the system prompt.
     */
    private function getDatabaseSchema(): string
    {
        $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");

        $schema = '';
        foreach ($tables as $table) {
            $tableName = $table->name;

            // Skip internal tables
            if (in_array($tableName, ['migrations', 'personal_access_tokens', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'sessions', 'password_reset_tokens', 'chat_conversations', 'chat_messages'])) {
                continue;
            }

            $columns = DB::select("PRAGMA table_info(\"{$tableName}\")");
            $colDefs = [];
            foreach ($columns as $col) {
                $colDefs[] = "    {$col->name} {$col->type}" . ($col->pk ? ' PRIMARY KEY' : '') . ($col->notnull ? ' NOT NULL' : '');
            }
            $schema .= "{$tableName} (\n" . implode(",\n", $colDefs) . "\n)\n\n";
        }

        return $schema;
    }

    /**
     * Format query results as a markdown table.
     */
    private function formatResultsAsTable(array $rows): string
    {
        if (empty($rows)) return '';

        $headers = array_keys($rows[0]);

        // Limit columns for readability
        if (count($headers) > 8) {
            $headers = array_slice($headers, 0, 8);
            $rows = array_map(fn($r) => array_slice($r, 0, 8, true), $rows);
        }

        // Human-readable column headers (snake_case → Title Case)
        $displayHeaders = array_map(
            fn($h) => ucwords(str_replace('_', ' ', $h)),
            $headers
        );

        $displayRows = array_slice($rows, 0, 20);

        $table = "\n| " . implode(' | ', $displayHeaders) . " |\n";
        $table .= "| " . implode(' | ', array_fill(0, count($headers), '---')) . " |\n";

        foreach ($displayRows as $row) {
            $values = [];
            foreach ($headers as $h) {
                $val = $row[$h] ?? '';
                $val = str_replace(['|', "\n", "\r"], ['\|', ' ', ''], (string) $val);
                // Trim timestamps to date only (e.g. 2026-03-12 00:00:00 → 2026-03-12)
                $val = preg_replace('/^(\d{4}-\d{2}-\d{2}) 00:00:00$/', '$1', $val);
                $values[] = \Illuminate\Support\Str::limit((string) $val, 40);
            }
            $table .= "| " . implode(' | ', $values) . " |\n";
        }

        if (count($rows) > 20) {
            $table .= "\n*... and " . (count($rows) - 20) . " more rows*";
        }

        return $table;
    }

    /**
     * Send a small, cheap AI call to turn raw DB rows into a natural human sentence.
     * No schema is sent — only the data rows — so token cost is minimal.
     */
    private function buildNaturalResponse(array $queryResult, string $aiResponse, string $apiKey): string
    {
        // Extract heading from the AI's first response
        $beforeSql = preg_replace('/```sql.*$/si', '', $aiResponse);
        $heading   = '';
        foreach (array_filter(array_map('trim', explode("\n", $beforeSql))) as $line) {
            if (!preg_match('/\b(sql|query|table|database|I will|let me|here\'?s|execute|retrieve)\b/i', $line)) {
                $heading = rtrim($line, ':');
                break;
            }
        }

        if (empty($queryResult)) {
            return $heading
                ? "Looks like there's nothing to report for **{$heading}** right now."
                : "Nothing found at this time.";
        }

        $rows  = array_map(fn($r) => (array) $r, $queryResult);
        $count = count($rows);

        // Single numeric result — no need for an AI call
        if ($count === 1 && count($rows[0]) === 1) {
            $value = array_values($rows[0])[0];
            if (is_numeric($value)) {
                $n = $value == (int)$value ? (int)$value : $value;
                $topic = strtolower($heading ?: 'total');
                return $n === 0
                    ? "There are currently no {$topic}."
                    : "You have a total of **{$n}** {$topic}.";
            }
            return $heading ? "**{$heading}:** {$value}" : "**{$value}**";
        }

        // Format dates before sending to AI
        $cleanRows = array_map(function ($row) {
            return array_map(function ($val) {
                if (is_string($val) && preg_match('/^(\d{4})-(\d{2})-(\d{2})( 00:00:00)?$/', $val, $m)) {
                    return date('d M Y', mktime(0, 0, 0, (int)$m[2], (int)$m[3], (int)$m[1]));
                }
                return $val;
            }, $row);
        }, $rows);

        // Compact the data as a simple text block (cheap tokens)
        $dataText = '';
        foreach ($cleanRows as $i => $row) {
            $dataText .= ($i + 1) . '. ' . implode(' | ', array_filter(array_values($row), fn($v) => $v !== null && $v !== '')) . "\n";
        }
        if ($count > 15) {
            $dataText .= "(and " . ($count - 15) . " more)\n";
        }

        try {
            $formatResponse = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type'  => 'application/json',
            ])->timeout(20)->post('https://api.openai.com/v1/chat/completions', [
                'model'       => config('services.openai.model', 'gpt-4o-mini'),
                'max_tokens'  => 300,
                'temperature' => 0.4,
                'messages'    => [
                    [
                        'role'    => 'system',
                        'content' => implode("\n", [
                            'You are an HR assistant writing to your manager in plain, friendly English.',
                            'Turn the data below into 1-3 natural sentences. Rules:',
                            '- Sound like a person talking, not a report',
                            '- Use bold (**name**) for people\'s names only',
                            '- Keep dates as given (e.g. 12 Mar 2026)',
                            '- Include all relevant detail but no fluff',
                            '- No bullet points, no tables, no lists, no headers',
                            '- Never say "Based on the data" or "According to the records"',
                        ]),
                    ],
                    [
                        'role'    => 'user',
                        'content' => "Topic: {$heading}\nData:\n{$dataText}",
                    ],
                ],
            ]);

            if ($formatResponse->successful()) {
                $natural = trim($formatResponse->json('choices.0.message.content') ?? '');
                if ($natural) return $natural;
            }
        } catch (\Exception $e) {
            // Fall through to plain fallback
        }

        // Fallback: plain bullet list if AI call fails
        return $this->interpretQueryResults($queryResult, $aiResponse);
    }
    private function interpretQueryResults(array $queryResult, string $originalResponse): string
    {
        // Extract the heading line (before SQL block, skip technical phrases)
        $beforeSql = preg_replace('/```sql.*$/si', '', $originalResponse);
        $heading   = '';
        foreach (array_filter(array_map('trim', explode("\n", $beforeSql))) as $line) {
            if (!preg_match('/\b(sql|query|table|database|column|row|record|I will|let me|here\'?s|execute|retrieve|look into)\b/i', $line)) {
                $heading = rtrim($line, ':') . ':';
                break;
            }
        }

        if (empty($queryResult)) {
            $h = $heading ?: 'Result:';
            return "{$h}\n\nNothing found at this time.";
        }

        $rows  = array_map(fn($row) => (array) $row, $queryResult);
        $count = count($rows);

        // Single numeric result (COUNT, SUM, etc.)
        if ($count === 1 && count($rows[0]) === 1) {
            $key    = array_key_first($rows[0]);
            $value  = $rows[0][$key];
            $h      = $heading ?: ucwords(str_replace('_', ' ', $key)) . ':';
            $number = is_numeric($value) ? ($value == (int)$value ? (int)$value : $value) : null;

            if ($number !== null) {
                return $number === 0
                    ? "{$h}\n\nNone at this time."
                    : "{$h}\n\n**{$number}**";
            }
            return "{$h}\n\n**{$value}**";
        }

        // Multi-row: build a conversational bullet list
        $h        = $heading ? $heading . "\n\n" : '';
        $keys     = array_keys($rows[0]);
        // The first column is treated as the primary identifier (usually name)
        $nameKey  = $keys[0];
        $detailKeys = array_slice($keys, 1);

        $lines = [];
        $displayRows = array_slice($rows, 0, 15);
        foreach ($displayRows as $row) {
            $name    = $row[$nameKey] ?? '—';
            $details = [];
            foreach ($detailKeys as $k) {
                $val = $row[$k] ?? null;
                if ($val === null || $val === '') continue;
                // Clean up timestamps
                $val = preg_replace('/^(\d{4}-\d{2}-\d{2}) 00:00:00$/', '$1', (string)$val);
                $details[] = $val;
            }
            $line = '- **' . $name . '**';
            if (!empty($details)) {
                $line .= ' — ' . implode(', ', $details);
            }
            $lines[] = $line;
        }

        $result = $h . implode("\n", $lines);

        if ($count > 15) {
            $result .= "\n\n*...and " . ($count - 15) . " more.*";
        }

        return $result;
    }

    /**
     * Summarize query results for AI interpretation.
     */
    private function summarizeQueryResults(array $queryResult): string
    {
        if (empty($queryResult)) {
            return "No records found (0 rows returned).";
        }

        $resultArray = array_map(fn($row) => (array) $row, $queryResult);
        $count = count($resultArray);
        
        // For single numeric results (counts, sums, etc.)
        if ($count === 1 && count($resultArray[0]) === 1) {
            $key = array_key_first($resultArray[0]);
            $value = $resultArray[0][$key];
            return "Result: {$value} (field: {$key})";
        }

        // For multiple rows, provide summary
        $summary = "Found {$count} record(s).\n\n";
        
        // Show first few rows
        $displayLimit = min(20, $count);
        $summary .= $this->formatResultsAsTable(array_slice($resultArray, 0, $displayLimit));
        
        if ($count > $displayLimit) {
            $summary .= "\n\n(... and " . ($count - $displayLimit) . " more records)";
        }

        return $summary;
    }
}
