<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type'      => 'required|in:Annual,Sick,Personal,Parental',
            'from_date' => 'required|date|after_or_equal:today',
            'to_date'   => 'required|date|after_or_equal:from_date',
            'days'      => 'required|integer|min:1',
            'reason'    => 'nullable|string|max:1000',
        ];
    }
}
