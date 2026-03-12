<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HrJob extends Model
{
    use SoftDeletes;

    protected $table = 'hr_jobs';
    protected $fillable = ['title', 'department_id', 'location', 'type', 'applicants', 'status', 'description', 'created_by', 'posted_at'];
    protected $casts = ['posted_at' => 'datetime'];

    public function department() { return $this->belongsTo(Department::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
