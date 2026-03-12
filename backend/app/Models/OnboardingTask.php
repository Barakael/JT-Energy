<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OnboardingTask extends Model
{
    protected $fillable = ['user_id', 'task', 'category', 'done'];
    protected $casts = ['done' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
}
