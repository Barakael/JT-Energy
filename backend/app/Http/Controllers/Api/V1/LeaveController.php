<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function balances(Request $request): JsonResponse
    {
        $userId = $request->user()->hasRole('hr_admin') && $request->user_id
            ? $request->user_id
            : $request->user()->id;

        $balances = LeaveBalance::where('user_id', $userId)
            ->where('year', now()->year)
            ->get()
            ->map(fn($b) => [
                'type'      => $b->type,
                'total'     => $b->total,
                'used'      => $b->used,
                'available' => $b->available,
            ]);

        return response()->json($balances);
    }

    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with('user', 'reviewer')->latest();

        if (!$request->user()->hasRole('hr_admin')) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json(LeaveRequestResource::collection($query->paginate(20))->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'      => 'required|in:Annual,Sick,Personal,Parental',
            'from_date' => 'required|date',
            'to_date'   => 'required|date|after_or_equal:from_date',
            'days'      => 'required|integer|min:1',
            'reason'    => 'nullable|string|max:1000',
        ]);

        $req = LeaveRequest::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'status'  => 'Pending',
        ]));

        return response()->json(new LeaveRequestResource($req->load('user')), 201);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        if ($leaveRequest->status !== 'Pending') {
            return response()->json(['message' => 'Request is not pending'], 422);
        }

        $leaveRequest->update([
            'status'      => 'Approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Increment leave balance used
        LeaveBalance::where('user_id', $leaveRequest->user_id)
            ->where('type', $leaveRequest->type)
            ->where('year', now()->year)
            ->increment('used', $leaveRequest->days);

        return response()->json(new LeaveRequestResource($leaveRequest->load('user', 'reviewer')));
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        if ($leaveRequest->status !== 'Pending') {
            return response()->json(['message' => 'Request is not pending'], 422);
        }

        $leaveRequest->update([
            'status'      => 'Rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(new LeaveRequestResource($leaveRequest->load('user', 'reviewer')));
    }
}
