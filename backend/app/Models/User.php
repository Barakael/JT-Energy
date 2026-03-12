<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'employee_id', 'avatar',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function profile() { return $this->hasOne(EmployeeProfile::class); }
    public function emergencyContact() { return $this->hasOne(EmergencyContact::class); }
    public function bankTax() { return $this->hasOne(BankTaxDetail::class); }
    public function leaveBalances() { return $this->hasMany(LeaveBalance::class); }
    public function leaveRequests() { return $this->hasMany(LeaveRequest::class); }
    public function attendanceRecords() { return $this->hasMany(AttendanceRecord::class); }
    public function documents() { return $this->hasMany(Document::class); }
    public function tickets() { return $this->hasMany(SupportTicket::class); }
    public function payslips() { return $this->hasMany(Payslip::class); }
    public function reviewsReceived() { return $this->hasMany(PerformanceReview::class, 'reviewee_id'); }
    public function reviewsGiven() { return $this->hasMany(PerformanceReview::class, 'reviewer_id'); }
    public function transfers() { return $this->hasMany(Transfer::class); }
    public function exitRecord() { return $this->hasOne(ExitRecord::class); }
    public function newHire() { return $this->hasOne(NewHire::class); }
    public function onboardingTasks() { return $this->hasMany(OnboardingTask::class); }
    public function surveyResponses() { return $this->hasMany(SurveyResponse::class); }
    public function trainingEnrollments() { return $this->belongsToMany(TrainingProgram::class, 'training_enrollments')
        ->withPivot('progress', 'status')->withTimestamps(); }
}
