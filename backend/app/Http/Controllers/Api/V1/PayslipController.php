<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PayslipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->hasRole('hr_admin')
            ? Payslip::with('user:id,name,email')
            : Payslip::where('user_id', $request->user()->id);

        $payslips = $query->orderByDesc('period_start')->get()->map(fn($p) => [
            'id'            => $p->id,
            'period'        => $p->period,
            'quarter'       => $p->quarter,
            'year'          => $p->year,
            'period_start'  => $p->period_start,
            'period_end'    => $p->period_end,
            'gross'         => $p->gross,
            'deductions'    => $p->deductions,
            'net'           => $p->net,
            'status'        => $p->status,
            'authorized_by' => $p->authorized_by,
            'date_issued'   => $p->date_issued?->format('M d, Y'),
            'employee'      => $p->user?->name,
            'employee_id'   => $p->user?->employee_id ?? $p->user_id,
        ]);

        return response()->json($payslips);
    }

    public function store(Request $request): JsonResponse
    {
        $request->user()->hasRole('hr_admin') || abort(403);

        $data = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'period'        => 'required|string|max:50',
            'quarter'       => 'nullable|in:Q1,Q2,Q3,Q4',
            'year'          => 'nullable|integer|min:2000|max:2100',
            'period_start'  => 'required|date',
            'period_end'    => 'required|date|after_or_equal:period_start',
            'gross'         => 'required|numeric|min:0',
            'deductions'    => 'required|numeric|min:0',
            'net'           => 'required|numeric|min:0',
            'status'        => 'nullable|in:Pending,Paid',
            'authorized_by' => 'nullable|string|max:255',
            'date_issued'   => 'nullable|date',
        ]);

        $data['status'] = $data['status'] ?? 'Pending';
        $payslip = Payslip::create($data);
        $payslip->load('user:id,name,email');

        return response()->json([
            'id'            => $payslip->id,
            'period'        => $payslip->period,
            'quarter'       => $payslip->quarter,
            'year'          => $payslip->year,
            'period_start'  => $payslip->period_start,
            'period_end'    => $payslip->period_end,
            'gross'         => $payslip->gross,
            'deductions'    => $payslip->deductions,
            'net'           => $payslip->net,
            'status'        => $payslip->status,
            'authorized_by' => $payslip->authorized_by,
            'date_issued'   => $payslip->date_issued?->format('M d, Y'),
            'employee'      => $payslip->user?->name,
        ], 201);
    }

    public function update(Request $request, Payslip $payslip): JsonResponse
    {
        $request->user()->hasRole('hr_admin') || abort(403);

        $data = $request->validate([
            'period'        => 'nullable|string|max:50',
            'quarter'       => 'nullable|in:Q1,Q2,Q3,Q4',
            'year'          => 'nullable|integer|min:2000|max:2100',
            'period_start'  => 'nullable|date',
            'period_end'    => 'nullable|date',
            'gross'         => 'nullable|numeric|min:0',
            'deductions'    => 'nullable|numeric|min:0',
            'net'           => 'nullable|numeric|min:0',
            'status'        => 'nullable|in:Pending,Paid',
            'authorized_by' => 'nullable|string|max:255',
            'date_issued'   => 'nullable|date',
        ]);

        $payslip->update($data);

        return response()->json([
            'id'            => $payslip->id,
            'period'        => $payslip->period,
            'quarter'       => $payslip->quarter,
            'year'          => $payslip->year,
            'period_start'  => $payslip->period_start,
            'period_end'    => $payslip->period_end,
            'gross'         => $payslip->gross,
            'deductions'    => $payslip->deductions,
            'net'           => $payslip->net,
            'status'        => $payslip->status,
            'authorized_by' => $payslip->authorized_by,
            'date_issued'   => $payslip->date_issued?->format('M d, Y'),
            'employee'      => $payslip->user?->name,
        ]);
    }

    public function destroy(Payslip $payslip, Request $request): JsonResponse
    {
        $request->user()->hasRole('hr_admin') || abort(403);
        $payslip->delete();
        return response()->json(['message' => 'Payslip deleted']);
    }

    public function download(Payslip $payslip, Request $request): mixed
    {
        // Employees can only download their own payslips
        if (!$request->user()->hasRole('hr_admin') && $payslip->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($payslip->file_path && Storage::exists($payslip->file_path)) {
            return Storage::download($payslip->file_path);
        }

        return response()->json(['message' => 'File not found'], 404);
    }
}
