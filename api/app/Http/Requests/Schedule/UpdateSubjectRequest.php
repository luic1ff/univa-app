<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'         => ['sometimes', 'string', 'max:255'],
            'teacher_name' => ['nullable', 'string', 'max:255'],
            'color'        => ['nullable', 'string', 'max:20'],
        ];
    }
}
