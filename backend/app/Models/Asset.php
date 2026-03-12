<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
{
    protected $fillable = [
        'asset_tag', 'name', 'category_id', 'serial_number',
        'purchase_date', 'purchase_price', 'warranty_expiry',
        'station_id', 'description', 'quantity', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date'  => 'date',
            'warranty_expiry' => 'date',
            'purchase_price' => 'decimal:2',
            'quantity'       => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
