<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payslip extends Model
{
    protected $fillable = [
        'user_id', 'period', 'quarter', 'year', 'period_start', 'period_end',
        'gross', 'deductions', 'net', 'file_path', 'status', 'authorized_by', 'date_issued',
    ];
    protected $casts = [
        'period_start' => 'date', 'period_end' => 'date', 'date_issued' => 'date',
        'gross' => 'decimal:2', 'deductions' => 'decimal:2', 'net' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
