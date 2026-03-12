<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Survey extends Model
{
    protected $fillable = ['title', 'description', 'status', 'created_by'];

    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function questions() { return $this->hasMany(SurveyQuestion::class)->orderBy('order'); }
    public function responses() { return $this->hasMany(SurveyResponse::class); }
}

