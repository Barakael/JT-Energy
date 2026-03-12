<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HrJob;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $employeeCount = User::role('employee')->count();

        $openJobs = HrJob::where('status', 'Open')->count();

        $onLeaveToday = LeaveRequest::where('status', 'Approved')
            ->whereDate('from_date', '<=', now())
            ->whereDate('to_date', '>=', now())
            ->count();

        $pendingApprovals = LeaveRequest::where('status', 'Pending')->count();

        return response()->json([
            'employee_count'    => $employeeCount,
            'open_jobs'         => $openJobs,
            'on_leave_today'    => $onLeaveToday,
            'pending_approvals' => $pendingApprovals,
        ]);
    }
}
