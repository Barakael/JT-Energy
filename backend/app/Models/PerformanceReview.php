<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceReview extends Model
{
    protected $fillable = ['reviewee_id', 'reviewer_id', 'department_id', 'rating', 'period', 'feedback', 'status'];

    public function reviewee() { return $this->belongsTo(User::class, 'reviewee_id'); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewer_id'); }
    public function department() { return $this->belongsTo(Department::class); }
}
