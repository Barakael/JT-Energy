<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->hasRole('hr_admin'); }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8',
            'employee_id'   => 'nullable|string|unique:users,employee_id',
            'department_id' => 'nullable|exists:departments,id',
            'title'         => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:30',
            'location'      => 'nullable|string|max:255',
            'status'        => 'nullable|in:Active,Probation,Exiting',
            'joined_at'     => 'nullable|date',
        ];
    }
}
