<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainingProgramResource;
use App\Models\TrainingEnrollment;
use App\Models\TrainingProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingController extends Controller
{
    // --- Programs ---

    public function index(): JsonResponse
    {
        $programs = TrainingProgram::withCount('enrollments')->latest()->paginate(20);
        return response()->json(TrainingProgramResource::collection($programs)->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'category'     => 'nullable|string',
            'instructor'   => 'nullable|string',
            'mode'         => 'nullable|in:Online,Offline,Hybrid',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
            'start_time'   => 'nullable|date_format:H:i',
            'end_time'     => 'nullable|date_format:H:i',
            'venue'        => 'nullable|string|max:255',
            'max_capacity' => 'nullable|integer|min:1',
            'duration'     => 'nullable|string',
            'description'  => 'nullable|string',
        ]);
        $data['created_by'] = $request->user()->id;
        $program = TrainingProgram::create($data);
        return response()->json(new TrainingProgramResource($program), 201);
    }

    public function update(Request $request, TrainingProgram $training): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'nullable|string|max:255',
            'category'     => 'nullable|string',
            'instructor'   => 'nullable|string',
            'mode'         => 'nullable|in:Online,Offline,Hybrid',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date',
            'start_time'   => 'nullable|date_format:H:i',
            'end_time'     => 'nullable|date_format:H:i',
            'venue'        => 'nullable|string|max:255',
            'max_capacity' => 'nullable|integer|min:1',
            'duration'     => 'nullable|string',
            'status'       => 'nullable|in:Upcoming,Ongoing,Completed,Cancelled,Active,Draft',
            'description'  => 'nullable|string',
        ]);
        $training->update($data);
        return response()->json(new TrainingProgramResource($training->loadCount('enrollments')));
    }

    public function destroy(TrainingProgram $training): JsonResponse
    {
        $training->delete();
        return response()->json(['message' => 'Training program deleted']);
    }

    // --- Enrollments ---

    public function enrollments(Request $request, TrainingProgram $training): JsonResponse
    {
        $enrollments = $training->enrollments()->with('user')->get();
        return response()->json($enrollments);
    }

    public function enroll(Request $request, TrainingProgram $training): JsonResponse
    {
        $userId = $request->user()->hasRole('hr_admin')
            ? ($request->input('user_id') ?? $request->user()->id)
            : $request->user()->id;

        $existing = TrainingEnrollment::where('training_program_id', $training->id)
            ->where('user_id', $userId)->first();

        if ($existing) {
            return response()->json(['message' => 'Already enrolled'], 409);
        }

        $enrollment = TrainingEnrollment::create([
            'training_program_id' => $training->id,
            'user_id'             => $userId,
            'status'              => 'Enrolled',
            'progress'            => 0,
        ]);

        return response()->json($enrollment, 201);
    }

    public function updateProgress(Request $request, TrainingProgram $training, TrainingEnrollment $enrollment): JsonResponse
    {
        if (!$request->user()->hasRole('hr_admin') && $enrollment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $data = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'status'   => 'nullable|in:Enrolled,In Progress,Completed,Dropped',
        ]);
        if ($data['progress'] == 100) {
            $data['status'] = 'Completed';
        }
        $enrollment->update($data);
        return response()->json($enrollment);
    }

    // --- Employee: my trainings ---

    public function myEnrollments(Request $request): JsonResponse
    {
        $enrollments = TrainingEnrollment::with('trainingProgram')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json($enrollments);
    }

    // --- Bulk assign by department ---

    public function assignByDepartment(Request $request, TrainingProgram $training): JsonResponse
    {
        $data = $request->validate([
            'all_departments'   => 'nullable|boolean',
            'department_ids'    => 'nullable|array',
            'department_ids.*'  => 'exists:departments,id',
        ]);

        if (!empty($data['all_departments'])) {
            $userIds = \App\Models\EmployeeProfile::pluck('user_id');
        } else {
            if (empty($data['department_ids'])) {
                return response()->json(['message' => 'Please provide department_ids or set all_departments to true'], 422);
            }
            $userIds = \App\Models\EmployeeProfile::whereIn('department_id', $data['department_ids'])->pluck('user_id');
        }

        $created = 0;
        foreach ($userIds as $userId) {
            $exists = TrainingEnrollment::where('training_program_id', $training->id)
                ->where('user_id', $userId)->exists();
            if (!$exists) {
                TrainingEnrollment::create([
                    'training_program_id' => $training->id,
                    'user_id'             => $userId,
                    'status'              => 'Not Started',
                    'progress'            => 0,
                    'attended'            => false,
                ]);
                $created++;
            }
        }

        return response()->json([
            'message'        => "{$created} employee(s) assigned",
            'assigned_count' => $created,
        ], 201);
    }

    // --- Attendees list ---

    public function attendees(TrainingProgram $training): JsonResponse
    {
        $enrollments = $training->enrollments()->with('user')->get()->map(fn($e) => [
            'enrollment_id' => $e->id,
            'user_id'       => $e->user_id,
            'name'          => $e->user?->name,
            'email'         => $e->user?->email,
            'status'        => $e->status,
            'attended'      => (bool) $e->attended,
        ]);
        return response()->json($enrollments);
    }

    // --- Mark attended ---

    public function markAttended(Request $request, TrainingProgram $training, TrainingEnrollment $enrollment): JsonResponse
    {
        $data = $request->validate(['attended' => 'required|boolean']);
        $enrollment->update($data);
        return response()->json(['enrollment_id' => $enrollment->id, 'attended' => (bool) $enrollment->attended]);
    }

    // --- Bulk assign trainees (by user IDs) ---

    public function assignTrainees(Request $request, TrainingProgram $training): JsonResponse
    {
        $data = $request->validate([
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $created = 0;
        foreach ($data['user_ids'] as $userId) {
            $existing = TrainingEnrollment::where('training_program_id', $training->id)
                ->where('user_id', $userId)->first();
            if (!$existing) {
                TrainingEnrollment::create([
                    'training_program_id' => $training->id,
                    'user_id'             => $userId,
                    'status'              => 'Not Started',
                    'progress'            => 0,
                ]);
                $created++;
            }
        }

        return response()->json([
            'message' => "{$created} trainee(s) assigned successfully",
            'assigned_count' => $created,
        ], 201);
    }
}
