<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExitRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $exits = ExitRecord::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($exits);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id'          => 'required|exists:users,id',
            'exit_type'        => 'required|in:Resignation,Termination,Retirement,Contract End',
            'last_day'         => 'required|date',
            'clearance_status' => 'nullable|in:Not Started,Pending,In Progress,Completed',
        ]);

        $exit = ExitRecord::create([
            ...$data,
            'clearance_status' => $data['clearance_status'] ?? 'Not Started',
            'status'           => 'Initiated',
            'initiated_by'     => $request->user()->id,
        ]);

        return response()->json($exit->load('user:id,name,email'), 201);
    }

    public function update(Request $request, ExitRecord $exit): JsonResponse
    {
        $data = $request->validate([
            'clearance_status' => 'sometimes|in:Not Started,Pending,In Progress,Completed',
            'last_day'         => 'sometimes|date',
            'status'           => 'sometimes|in:Initiated,In Progress,Completed',
        ]);

        $exit->update($data);
        return response()->json($exit->fresh()->load('user:id,name,email'));
    }

    public function destroy(ExitRecord $exit): JsonResponse
    {
        $exit->delete();
        return response()->json(['message' => 'Exit record deleted']);
    }
}
