<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'   => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'type'    => 'nullable|in:Contract,Legal,Review,Certificate,Policy,Other',
            'file'    => 'nullable|file|mimes:pdf,docx,doc,jpg,jpeg,png|max:10240',
            'status'  => 'nullable|in:Active,Pending',
        ];
    }
}
