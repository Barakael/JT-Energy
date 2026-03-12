<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    protected $fillable = ['user_id', 'department_id', 'manager_id', 'title', 'phone', 'location', 'status', 'joined_at'];
    protected $casts = ['joined_at' => 'date'];

    public function user() { return $this->belongsTo(User::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function manager() { return $this->belongsTo(User::class, 'manager_id'); }
}
