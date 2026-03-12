<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Interviewee;
use App\Models\InterviewFeedback;
use App\Models\HrJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    /**
     * List interviews for a specific job posting.
     */
    public function index(HrJob $job): JsonResponse
    {
        $interviews = $job->interviews ?? Interview::where('hr_job_id', $job->id)
            ->with(['interviewers:id,name,email', 'interviewees', 'creator:id,name'])
            ->withCount('interviewees')
            ->latest()
            ->get();

        // Re-query properly
        $interviews = Interview::where('hr_job_id', $job->id)
            ->with(['interviewers:id,name,email', 'interviewees', 'creator:id,name'])
            ->withCount('interviewees')
            ->latest()
            ->get();

        return response()->json($interviews);
    }

    /**
     * Create an interview for a job, with interviewers and interviewees.
     */
    public function store(Request $request, HrJob $job): JsonResponse
    {
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'scheduled_date'  => 'required|date',
            'scheduled_time'  => 'nullable|date_format:H:i',
            'venue'           => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'interviewer_ids'   => 'required|array|min:1',
            'interviewer_ids.*' => 'exists:users,id',
            'interviewees'        => 'required|array|min:1',
            'interviewees.*.name' => 'required|string|max:255',
            'interviewees.*.email'=> 'nullable|email',
            'interviewees.*.phone'=> 'nullable|string|max:30',
        ]);

        $interview = Interview::create([
            'hr_job_id'      => $job->id,
            'title'          => $data['title'],
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $data['scheduled_time'] ?? null,
            'venue'          => $data['venue'] ?? null,
            'description'    => $data['description'] ?? null,
            'status'         => 'Scheduled',
            'created_by'     => $request->user()->id,
        ]);

        // Attach interviewers
        $interview->interviewers()->sync($data['interviewer_ids']);

        // Create interviewees
        foreach ($data['interviewees'] as $ie) {
            Interviewee::create([
                'interview_id' => $interview->id,
                'name'         => $ie['name'],
                'email'        => $ie['email'] ?? null,
                'phone'        => $ie['phone'] ?? null,
                'status'       => 'Pending',
            ]);
        }

        $interview->load(['interviewers:id,name,email', 'interviewees', 'creator:id,name']);

        return response()->json($interview, 201);
    }

    /**
     * Show a single interview with full details.
     * HR admins see all feedback; interviewers see only their own.
     */
    public function show(Request $request, Interview $interview): JsonResponse
    {
        $interview->load(['interviewers:id,name,email', 'interviewees', 'creator:id,name', 'job:id,title']);

        $user = $request->user();
        $isAdmin = $user->hasRole('hr_admin');

        // Load feedback with interviewer info
        $interviewees = $interview->interviewees->map(function ($ie) use ($isAdmin, $user) {
            $feedbackQuery = InterviewFeedback::where('interviewee_id', $ie->id)
                ->with('interviewer:id,name');

            if (!$isAdmin) {
                // Blind scoring: only show own feedback
                $feedbackQuery->where('interviewer_id', $user->id);
            }

            $feedback = $feedbackQuery->get();

            return [
                'id'              => $ie->id,
                'name'            => $ie->name,
                'email'           => $ie->email,
                'phone'           => $ie->phone,
                'status'          => $ie->status,
                'feedback'        => $feedback,
                'average_marks'   => $isAdmin && $feedback->count() > 0 ? round($feedback->avg('marks'), 1) : null,
                'feedback_count'  => $isAdmin ? $feedback->count() : null,
            ];
        });

        return response()->json([
            'id'              => $interview->id,
            'title'           => $interview->title,
            'scheduled_date'  => $interview->scheduled_date->format('Y-m-d'),
            'scheduled_time'  => $interview->scheduled_time,
            'venue'           => $interview->venue,
            'description'     => $interview->description,
            'status'          => $interview->status,
            'job'             => $interview->job,
            'creator'         => $interview->creator,
            'interviewers'    => $interview->interviewers,
            'interviewees'    => $interviewees,
        ]);
    }

    /**
     * Update interview details.
     */
    public function update(Request $request, Interview $interview): JsonResponse
    {
        $data = $request->validate([
            'title'          => 'nullable|string|max:255',
            'scheduled_date' => 'nullable|date',
            'scheduled_time' => 'nullable|date_format:H:i',
            'venue'          => 'nullable|string|max:255',
            'description'    => 'nullable|string',
            'status'         => 'nullable|in:Scheduled,In Progress,Completed,Cancelled',
        ]);

        $interview->update($data);
        $interview->load(['interviewers:id,name,email', 'interviewees', 'creator:id,name']);

        return response()->json($interview);
    }

    /**
     * Delete an interview.
     */
    public function destroy(Interview $interview): JsonResponse
    {
        $interview->delete();
        return response()->json(['message' => 'Interview deleted']);
    }

    /**
     * An interviewer submits feedback for an interviewee.
     */
    public function submitFeedback(Request $request, Interview $interview, Interviewee $interviewee): JsonResponse
    {
        $user = $request->user();

        // Verify this user is an interviewer for this interview
        if (!$interview->interviewers()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not assigned as an interviewer'], 403);
        }

        $data = $request->validate([
            'marks'          => 'required|integer|min:1|max:10',
            'comments'       => 'nullable|string',
            'recommendation' => 'required|in:Strong Yes,Yes,Neutral,No,Strong No',
        ]);

        $feedback = InterviewFeedback::updateOrCreate(
            [
                'interview_id'   => $interview->id,
                'interviewee_id' => $interviewee->id,
                'interviewer_id' => $user->id,
            ],
            $data
        );

        // Auto-update interviewee status
        $interviewee->update(['status' => 'Interviewed']);

        return response()->json($feedback, 201);
    }

    /**
     * List interviews where the current user is an interviewer.
     */
    public function myInterviews(Request $request): JsonResponse
    {
        $interviews = Interview::whereHas('interviewers', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })
            ->with(['job:id,title', 'interviewees', 'interviewers:id,name'])
            ->withCount('interviewees')
            ->latest()
            ->get();

        return response()->json($interviews);
    }
}
