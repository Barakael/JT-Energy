<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InterviewFeedback extends Model
{
    protected $table = 'interview_feedback';

    protected $fillable = [
        'interview_id', 'interviewee_id', 'interviewer_id',
        'marks', 'comments', 'recommendation',
    ];

    public function interview() { return $this->belongsTo(Interview::class); }
    public function interviewee() { return $this->belongsTo(Interviewee::class); }
    public function interviewer() { return $this->belongsTo(User::class, 'interviewer_id'); }
}
