<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject'     => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category'    => 'required|in:IT,HR,Facilities,Other',
            'priority'    => 'required|in:Low,Medium,High',
        ];
    }
}
