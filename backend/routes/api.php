<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\ExitController;
use App\Http\Controllers\Api\V1\JobController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\OnboardingController;
use App\Http\Controllers\Api\V1\PayslipController;
use App\Http\Controllers\Api\V1\PerformanceController;
use App\Http\Controllers\Api\V1\StationController;
use App\Http\Controllers\Api\V1\SurveyController;
use App\Http\Controllers\Api\V1\TicketController;
use App\Http\Controllers\Api\V1\TrainingController;
use App\Http\Controllers\Api\V1\TransferController;
use App\Http\Controllers\Api\V1\BankTaxDetailController;
use App\Http\Controllers\Api\V1\InterviewController;
use App\Http\Controllers\Api\V1\PolicyController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\AiChatController;
use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\AssetCategoryController;

// ── Public ────────────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

// ── Authenticated ─────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    Route::prefix('v1')->group(function () {

        // Dashboard stats
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Employees
        Route::apiResource('employees', EmployeeController::class);

        // Departments
        Route::apiResource('departments', DepartmentController::class);

        // Stations
        Route::apiResource('stations', StationController::class);

        // Attendance
        Route::get('/attendance',            [AttendanceController::class, 'index']);
        Route::post('/attendance',           [AttendanceController::class, 'store']);
        Route::post('/attendance/clock-in',  [AttendanceController::class, 'clockIn']);
        Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);

        // Leave
        Route::get('/leave/balances',                          [LeaveController::class, 'balances']);
        Route::get('/leave',                                   [LeaveController::class, 'index']);
        Route::post('/leave',                                  [LeaveController::class, 'store']);
        Route::post('/leave/{leaveRequest}/approve',           [LeaveController::class, 'approve']);
        Route::post('/leave/{leaveRequest}/reject',            [LeaveController::class, 'reject']);

        // Jobs / Recruitment
        Route::apiResource('jobs', JobController::class);

        // Interviews
        Route::get('/jobs/{job}/interviews',                                      [InterviewController::class, 'index']);
        Route::post('/jobs/{job}/interviews',                                     [InterviewController::class, 'store']);
        Route::get('/interviews/my',                                              [InterviewController::class, 'myInterviews']);
        Route::get('/interviews/{interview}',                                     [InterviewController::class, 'show']);
        Route::patch('/interviews/{interview}',                                   [InterviewController::class, 'update']);
        Route::delete('/interviews/{interview}',                                  [InterviewController::class, 'destroy']);
        Route::post('/interviews/{interview}/interviewees/{interviewee}/feedback', [InterviewController::class, 'submitFeedback']);

        // Onboarding
        Route::apiResource('onboarding', OnboardingController::class);
        Route::get('/onboarding/{hire}/tasks',                            [OnboardingController::class, 'tasks']);
        Route::post('/onboarding/{hire}/tasks',                           [OnboardingController::class, 'addTask']);
        Route::patch('/onboarding/{hire}/tasks/{task}/toggle',            [OnboardingController::class, 'toggleTask']);

        // Training
        Route::get('/training/my-enrollments',                            [TrainingController::class, 'myEnrollments']);
        Route::apiResource('training', TrainingController::class);
        Route::get('/training/{training}/enrollments',                    [TrainingController::class, 'enrollments']);
        Route::post('/training/{training}/enroll',                        [TrainingController::class, 'enroll']);
        Route::post('/training/{training}/assign-trainees',               [TrainingController::class, 'assignTrainees']);
        Route::post('/training/{training}/assign-by-department',          [TrainingController::class, 'assignByDepartment']);
        Route::get('/training/{training}/attendees',                      [TrainingController::class, 'attendees']);
        Route::patch('/training/{training}/enrollments/{enrollment}/attended', [TrainingController::class, 'markAttended']);
        Route::patch('/training/{training}/enrollments/{enrollment}',     [TrainingController::class, 'updateEnrollment']);

        // Payslips
        Route::get('/payslips',                    [PayslipController::class, 'index']);
        Route::post('/payslips',                   [PayslipController::class, 'store']);
        Route::put('/payslips/{payslip}',           [PayslipController::class, 'update']);
        Route::delete('/payslips/{payslip}',        [PayslipController::class, 'destroy']);
        Route::get('/payslips/{payslip}/download',  [PayslipController::class, 'download']);

        // Bank & Tax Details
        Route::get('/bank-tax/mine',               [BankTaxDetailController::class, 'mine']);
        Route::put('/bank-tax/mine',               [BankTaxDetailController::class, 'updateMine']);
        Route::apiResource('bank-tax', BankTaxDetailController::class);

        // Performance
        Route::apiResource('performance', PerformanceController::class);

        // Transfers
        Route::apiResource('transfers', TransferController::class);

        // Exit Management
        Route::apiResource('exits', ExitController::class);

        // Documents
        Route::get('/documents',                     [DocumentController::class, 'index']);
        Route::post('/documents',                    [DocumentController::class, 'store']);
        Route::delete('/documents/{document}',       [DocumentController::class, 'destroy']);
        Route::get('/documents/{document}/download', [DocumentController::class, 'download']);

        // Help Desk / Tickets
        Route::get('/tickets',          [TicketController::class, 'index']);
        Route::post('/tickets',         [TicketController::class, 'store']);
        Route::patch('/tickets/{ticket}', [TicketController::class, 'update']);

        // Surveys
        Route::get('/surveys',                        [SurveyController::class, 'index']);
        Route::post('/surveys',                       [SurveyController::class, 'store']);
        Route::delete('/surveys/{survey}',            [SurveyController::class, 'destroy']);
        Route::post('/surveys/{survey}/respond',      [SurveyController::class, 'respond']);
        Route::get('/surveys/{survey}/responses',     [SurveyController::class, 'responses']);

        // Policies & Rules
        Route::get('/policies',              [PolicyController::class, 'index']);
        Route::post('/policies',             [PolicyController::class, 'store']);
        Route::patch('/policies/{policy}',   [PolicyController::class, 'update']);
        Route::delete('/policies/{policy}',  [PolicyController::class, 'destroy']);
        Route::post('/policies/{policy}/read', [PolicyController::class, 'markRead']);

        // Notifications
        Route::get('/notifications/unread',  [NotificationController::class, 'unread']);
        Route::get('/notifications/count',   [NotificationController::class, 'count']);

        // Assets
        Route::apiResource('assets', AssetController::class);
        Route::apiResource('asset-categories', AssetCategoryController::class)->except(['show']);

        // AI Chat
        Route::post('/ai/chat',                       [AiChatController::class, 'chat']);
        Route::get('/ai/conversations',                [AiChatController::class, 'conversations']);
        Route::get('/ai/conversations/{conversation}', [AiChatController::class, 'messages']);
    });
});


