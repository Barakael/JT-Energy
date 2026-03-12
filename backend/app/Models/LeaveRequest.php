<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = ['user_id', 'type', 'from_date', 'to_date', 'days', 'reason', 'status', 'reviewed_by', 'reviewed_at'];
    protected $casts = ['from_date' => 'date', 'to_date' => 'date', 'reviewed_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
