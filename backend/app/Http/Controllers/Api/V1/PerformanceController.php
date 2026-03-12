<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PerformanceReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PerformanceReview::with([
            'reviewee:id,name',
            'reviewer:id,name',
            'department:id,name',
        ]);

        if (!$request->user()->hasRole('hr_admin')) {
            $query->where('reviewee_id', $request->user()->id);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reviewee_id'   => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'rating'        => 'required|numeric|min:0|max:10',
            'period'        => 'required|string',
            'feedback'      => 'nullable|string',
            'status'        => 'in:Draft,Submitted,Acknowledged',
        ]);

        $review = PerformanceReview::create([
            ...$data,
            'reviewer_id' => $request->user()->id,
            'status'      => $data['status'] ?? 'Draft',
        ]);

        return response()->json($review->load('reviewee:id,name', 'reviewer:id,name', 'department:id,name'), 201);
    }

    public function update(Request $request, PerformanceReview $performance): JsonResponse
    {
        $data = $request->validate([
            'rating'   => 'sometimes|numeric|min:0|max:10',
            'feedback' => 'sometimes|nullable|string',
            'status'   => 'sometimes|in:Draft,Submitted,Acknowledged',
        ]);

        $performance->update($data);
        return response()->json($performance->fresh()->load('reviewee:id,name', 'reviewer:id,name', 'department:id,name'));
    }

    public function destroy(PerformanceReview $performance): JsonResponse
    {
        $performance->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
