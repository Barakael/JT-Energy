<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interviewee extends Model
{
    protected $fillable = ['interview_id', 'name', 'email', 'phone', 'status'];

    public function interview() { return $this->belongsTo(Interview::class); }
    public function feedback() { return $this->hasMany(InterviewFeedback::class); }
}
