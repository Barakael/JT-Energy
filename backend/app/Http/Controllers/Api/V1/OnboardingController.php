<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewHireResource;
use App\Models\NewHire;
use App\Models\OnboardingTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    // --- New Hires (HR Admin) ---

    public function index(): JsonResponse
    {
        $hires = NewHire::with(['user', 'tasks'])->latest()->paginate(20);
        return response()->json(NewHireResource::collection($hires)->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id'        => 'required|exists:users,id',
            'start_date'     => 'required|date',
            'buddy_id'       => 'nullable|exists:users,id',
            'department_id'  => 'nullable|exists:departments,id',
            'notes'          => 'nullable|string',
        ]);

        $hire = NewHire::create($data);
        return response()->json(new NewHireResource($hire->load(['user', 'tasks'])), 201);
    }

    public function update(Request $request, NewHire $hire): JsonResponse
    {
        $data = $request->validate([
            'start_date'    => 'nullable|date',
            'buddy_id'      => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'status'        => 'nullable|in:Pending,In Progress,Completed',
            'notes'         => 'nullable|string',
        ]);
        $hire->update($data);
        return response()->json(new NewHireResource($hire->load(['user', 'tasks'])));
    }

    public function destroy(NewHire $hire): JsonResponse
    {
        $hire->delete();
        return response()->json(['message' => 'New hire record deleted']);
    }

    // --- Tasks ---

    public function tasks(Request $request, NewHire $hire): JsonResponse
    {
        if (!$request->user()->hasRole('hr_admin') && $hire->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($hire->tasks);
    }

    public function storeTask(Request $request, NewHire $hire): JsonResponse
    {
        $data = $request->validate([
            'title'    => 'required|string|max:255',
            'category' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);
        $task = $hire->tasks()->create(array_merge($data, ['is_done' => false]));
        return response()->json($task, 201);
    }

    public function toggleTask(Request $request, NewHire $hire, OnboardingTask $task): JsonResponse
    {
        if (!$request->user()->hasRole('hr_admin') && $hire->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($task->new_hire_id !== $hire->id) {
            return response()->json(['message' => 'Task not found'], 404);
        }
        $task->update(['is_done' => !$task->is_done]);
        return response()->json($task);
    }
}
