<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingProgram extends Model
{
    use SoftDeletes;

    protected $fillable = ['title', 'category', 'instructor', 'duration', 'status', 'description', 'created_by', 'venue', 'start_date', 'end_date', 'start_time', 'end_time', 'mode', 'max_capacity'];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function enrollments() { return $this->hasMany(TrainingEnrollment::class); }
    public function enrolledUsers() { return $this->belongsToMany(User::class, 'training_enrollments')
        ->withPivot('progress', 'status')->withTimestamps(); }
}
