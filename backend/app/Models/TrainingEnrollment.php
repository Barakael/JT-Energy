<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingEnrollment extends Model
{
    protected $fillable = ['user_id', 'training_program_id', 'progress', 'status', 'attended'];
    protected $casts = ['enrolled_at' => 'datetime', 'attended' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
    public function program() { return $this->belongsTo(TrainingProgram::class, 'training_program_id'); }
}
