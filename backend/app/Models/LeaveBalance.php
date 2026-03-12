<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    protected $fillable = ['user_id', 'type', 'total', 'used', 'year'];

    public function user() { return $this->belongsTo(User::class); }

    public function getAvailableAttribute(): int
    {
        return max(0, $this->total - $this->used);
    }
}
