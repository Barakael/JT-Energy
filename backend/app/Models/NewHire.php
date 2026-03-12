<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewHire extends Model
{
    protected $fillable = ['user_id', 'name', 'email', 'role', 'department_id', 'start_date', 'progress', 'buddy_id'];
    protected $casts = ['start_date' => 'date'];

    public function user() { return $this->belongsTo(User::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function buddy() { return $this->belongsTo(User::class, 'buddy_id'); }
}
