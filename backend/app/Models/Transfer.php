<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    protected $fillable = ['user_id', 'from_department_id', 'to_department_id', 'from_role', 'to_role', 'effective_date', 'reason', 'status', 'created_by'];
    protected $casts = ['effective_date' => 'date'];

    public function user() { return $this->belongsTo(User::class); }
    public function fromDepartment() { return $this->belongsTo(Department::class, 'from_department_id'); }
    public function toDepartment() { return $this->belongsTo(Department::class, 'to_department_id'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
