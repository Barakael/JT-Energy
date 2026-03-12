<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSurveyRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->hasRole('hr_admin'); }

    public function rules(): array
    {
        return [
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string|max:1000',
            'questions'          => 'required|array|min:1',
            'questions.*.text'   => 'required|string',
            'questions.*.type'   => 'required|in:text,rating,multiple_choice,yes_no',
            'questions.*.options'=> 'nullable|array',
        ];
    }
}
