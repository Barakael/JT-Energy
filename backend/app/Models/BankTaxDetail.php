<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankTaxDetail extends Model
{
    protected $fillable = [
        'user_id', 'bank_name', 'account_name', 'account_type', 'account_number',
        'sort_code', 'swift_bic', 'iban', 'tax_code', 'national_insurance',
    ];
    protected $casts = ['account_number' => 'encrypted'];
    protected $hidden = ['account_number'];

    public function user() { return $this->belongsTo(User::class); }

    public function getMaskedAccountAttribute(): string
    {
        if (!$this->account_number) return '';
        return '****' . substr($this->account_number, -4);
    }
}
