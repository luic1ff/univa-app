<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required'        => 'Введіть поточний пароль.',
            'current_password.current_password' => 'Поточний пароль невірний.',
            'password.required'                => 'Введіть новий пароль.',
            'password.min'                     => 'Пароль має бути не менше 8 символів.',
            'password.confirmed'               => 'Паролі не збігаються.',
        ];
    }
}
