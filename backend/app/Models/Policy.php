<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Policy extends Model
{
    protected $fillable = [
        'title', 'content', 'type', 'priority', 'target_type', 'created_by', 'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function recipients() { return $this->hasMany(PolicyRecipient::class); }

    /**
     * Scope: policies visible to a specific user.
     */
    public function scopeVisibleTo($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('target_type', 'All')
              ->orWhereHas('recipients', fn ($r) => $r->where('user_id', $userId));
        })->whereNotNull('published_at');
    }
}
