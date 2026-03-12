<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExitRecord extends Model
{
    protected $fillable = ['user_id', 'exit_type', 'last_day', 'clearance_status', 'status', 'initiated_by'];
    protected $casts = ['last_day' => 'date'];

    public function user() { return $this->belongsTo(User::class); }
    public function initiatedBy() { return $this->belongsTo(User::class, 'initiated_by'); }
}
