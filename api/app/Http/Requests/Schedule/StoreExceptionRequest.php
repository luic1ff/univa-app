<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExceptionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'date'                   => ['required', 'date'],
            'action'                 => ['required', Rule::in(['cancelled', 'rescheduled', 'modified'])],
            'override_starts_at'     => ['nullable', 'date_format:H:i'],
            'override_ends_at'       => ['nullable', 'date_format:H:i'],
            'override_location_text' => ['nullable', 'string', 'max:255'],
            'override_teacher'       => ['nullable', 'string', 'max:255'],
            'override_subject_id'    => ['nullable', 'integer', 'exists:subjects,id'],
            'reason'                 => ['nullable', 'string', 'max:500'],
        ];
    }
}
