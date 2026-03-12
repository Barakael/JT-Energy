<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'code', 'description', 'positions', 'station_id', 'active', 'head_user_id'];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function head() { return $this->belongsTo(User::class, 'head_user_id'); }
    public function station() { return $this->belongsTo(Station::class); }
    public function profiles() { return $this->hasMany(EmployeeProfile::class); }
    public function jobs() { return $this->hasMany(HrJob::class); }
    public function transfersFrom() { return $this->hasMany(Transfer::class, 'from_department_id'); }
    public function transfersTo() { return $this->hasMany(Transfer::class, 'to_department_id'); }
    public function performanceReviews() { return $this->hasMany(PerformanceReview::class); }
    public function newHires() { return $this->hasMany(NewHire::class); }
}
