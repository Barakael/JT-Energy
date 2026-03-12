<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    protected $fillable = ['name', 'code', 'description', 'location', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
