<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurveyQuestion extends Model
{
    protected $fillable = ['survey_id', 'text', 'type', 'options', 'order'];
    protected $casts = ['options' => 'array'];

    public function survey() { return $this->belongsTo(Survey::class); }
    public function answers() { return $this->hasMany(SurveyAnswer::class); }
}
