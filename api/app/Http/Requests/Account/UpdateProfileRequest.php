<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['nullable', 'string', 'max:100'],
            'username'   => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($this->user()->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => "Ім'я є обов'язковим.",
            'username.required'   => 'Нікнейм є обов\'язковим.',
            'username.unique'     => 'Цей нікнейм вже зайнятий.',
            'username.alpha_dash' => 'Нікнейм може містити лише літери, цифри, дефіси та підкреслення.',
        ];
    }
}
