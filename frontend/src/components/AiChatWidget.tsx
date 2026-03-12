import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, MessageSquarePlus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendMessage, useConversations, useConversationMessages, type ChatMessage } from "@/hooks/api/useAiChat";

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useSendMessage();
  const { data: conversations = [] } = useConversations();
  const { data: conversationMsgs } = useConversationMessages(conversationId);

  // Sync fetched messages into local state
  useEffect(() => {
    if (conversationMsgs) {
      setLocalMessages(conversationMsgs);
    }
  }, [conversationMsgs]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, sendMessage.isPending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;

    setInput("");
    setShowHistory(false);

    // Optimistic add user msg
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      conversation_id: conversationId ?? 0,
      role: "user",
      content: text,
      sql_query: null,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, tempUserMsg]);

    try {
      const result = await sendMessage.mutateAsync({
        message: text,
        conversation_id: conversationId ?? undefined,
      });

      if (!conversationId) {
        setConversationId(result.conversation_id);
      }

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        conversation_id: result.conversation_id,
        role: "assistant",
        content: result.message,
        sql_query: result.sql_query,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        conversation_id: conversationId ?? 0,
        role: "assistant",
        content: "Sorry, I am comming Comming soon!!",
        sql_query: null,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setLocalMessages([]);
    setShowHistory(false);
  };

  const loadConversation = (id: number) => {
    setConversationId(id);
    setShowHistory(false);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering for tables and bold
    const lines = content.split("\n");
    let inSqlBlock = false;
    
    return lines.map((line, i) => {
      // Hide SQL code blocks (technical details)
      if (line.startsWith("```sql")) {
        inSqlBlock = true;
        return null;
      }
      if (line.startsWith("```") && inSqlBlock) {
        inSqlBlock = false;
        return null;
      }
      if (inSqlBlock) {
        return null; // Skip SQL query lines
      }

      // Bold text
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      processed = processed.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>');

      if (line.startsWith("|") && line.endsWith("|")) {
        if (line.match(/^\|[\s-|]+\|$/)) {
          return null; // Skip separator rows
        }
        const cells = line.split("|").filter(Boolean).map((c) => c.trim());
        return (
          <div key={i} className="flex gap-2 text-xs font-mono">
            {cells.map((cell, j) => (
              <span key={j} className="truncate min-w-[60px]">{cell}</span>
            ))}
          </div>
        );
      }

      return (
        <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: processed || "&nbsp;" }} />
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open AI Chat"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[560px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">HR AI Assistant</p>
                <p className="text-[10px] opacity-80">Ask anything about your HR data</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/20" onClick={() => setShowHistory(!showHistory)}>
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/20" onClick={startNewChat}>
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/20" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showHistory ? (
            /* Conversation History */
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Recent Conversations</p>
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm ${conversationId === c.id ? "bg-muted" : ""}`}
                    onClick={() => loadConversation(c.id)}
                  >
                    <p className="truncate font-medium text-card-foreground">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(c.updated_at).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Messages */
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {localMessages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-card-foreground">How can I help?</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask about employees, attendance, leave, departments, and more.</p>
                  <div className="mt-4 space-y-1.5">
                    {["How many employees are in each department?", "Show me pending leave requests", "Who joined this month?"].map((q) => (
                      <button
                        key={q}
                        className="block w-full text-left text-xs bg-muted/50 hover:bg-muted px-3 py-2 rounded-lg transition-colors text-muted-foreground"
                        onClick={() => { setInput(q); }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-card-foreground"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="space-y-1">{renderContent(msg.content)}</div>
                    )}
                  </div>
                </div>
              ))}

              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-border p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your HR data..."
                className="min-h-[40px] max-h-[100px] resize-none text-sm"
                rows={1}
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
