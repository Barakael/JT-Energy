<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = ['ticket_number', 'user_id', 'subject', 'description', 'category', 'priority', 'status', 'assigned_to', 'department_id'];

    protected static function booted(): void
    {
        static::creating(function ($ticket) {
            $count = static::count() + 1;
            $ticket->ticket_number = 'TKT-' . str_pad($count, 4, '0', STR_PAD_LEFT);
        });
    }

    public function user() { return $this->belongsTo(User::class); }
    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function department() { return $this->belongsTo(Department::class); }
}
