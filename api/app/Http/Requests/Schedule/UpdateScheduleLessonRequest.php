<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_id'         => ['sometimes', 'integer', 'exists:subjects,id'],
            'weekday'            => ['sometimes', 'integer', 'min:1', 'max:7'],
            'starts_at'          => ['sometimes', 'date_format:H:i'],
            'ends_at'            => ['sometimes', 'date_format:H:i'],
            'lesson_type_id'     => ['sometimes', 'integer', 'exists:lesson_types,id'],
            'delivery_mode_id'   => ['sometimes', 'integer', 'exists:delivery_modes,id'],
            'location_text'      => ['nullable', 'string', 'max:255'],
            'note'               => ['nullable', 'string'],
            'recurrence_rule_id' => ['sometimes', 'integer', 'exists:recurrence_rules,id'],
            'active_from'        => ['sometimes', 'date'],
            'active_to'          => ['nullable', 'date'],
        ];
    }
}
