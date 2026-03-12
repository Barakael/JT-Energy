<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transfer::with([
            'user:id,name',
            'fromDepartment:id,name',
            'toDepartment:id,name',
        ]);

        if (!$request->user()->hasRole('hr_admin')) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id'            => 'required|exists:users,id',
            'from_department_id' => 'required|exists:departments,id',
            'to_department_id'   => 'required|exists:departments,id',
            'from_role'          => 'nullable|string',
            'to_role'            => 'nullable|string',
            'effective_date'     => 'required|date',
            'reason'             => 'nullable|string',
        ]);

        $transfer = Transfer::create([
            ...$data,
            'status'     => 'Pending',
            'created_by' => $request->user()->id,
        ]);

        return response()->json($transfer->load('user:id,name', 'fromDepartment:id,name', 'toDepartment:id,name'), 201);
    }

    public function update(Request $request, Transfer $transfer): JsonResponse
    {
        $data = $request->validate([
            'status'         => 'sometimes|in:Pending,Approved,Completed,Rejected',
            'effective_date' => 'sometimes|date',
            'reason'         => 'sometimes|nullable|string',
            'to_role'        => 'sometimes|nullable|string',
        ]);

        $transfer->update($data);
        return response()->json($transfer->fresh()->load('user:id,name', 'fromDepartment:id,name', 'toDepartment:id,name'));
    }

    public function destroy(Transfer $transfer): JsonResponse
    {
        $transfer->delete();
        return response()->json(['message' => 'Transfer deleted']);
    }
}
