<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $fillable = [
        'hr_job_id', 'title', 'scheduled_date', 'scheduled_time',
        'venue', 'description', 'status', 'created_by',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
    ];

    public function job() { return $this->belongsTo(HrJob::class, 'hr_job_id'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function interviewers() { return $this->belongsToMany(User::class, 'interview_interviewer')->withTimestamps(); }
    public function interviewees() { return $this->hasMany(Interviewee::class); }
    public function feedback() { return $this->hasMany(InterviewFeedback::class); }
}
