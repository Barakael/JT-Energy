<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    protected $fillable = ['user_id', 'date', 'clock_in', 'clock_out', 'hours', 'status'];
    protected $casts = ['date' => 'date'];

    public function user() { return $this->belongsTo(User::class); }
}
