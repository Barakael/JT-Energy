<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PolicyRecipient extends Model
{
    protected $fillable = ['policy_id', 'user_id', 'read_at'];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function policy() { return $this->belongsTo(Policy::class); }
    public function user() { return $this->belongsTo(User::class); }
}
