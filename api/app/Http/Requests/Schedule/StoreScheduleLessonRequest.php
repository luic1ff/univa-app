<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_id'         => ['required', 'integer', 'exists:subjects,id'],
            'weekday'            => ['required', 'integer', 'min:1', 'max:7'],
            'starts_at'          => ['required', 'date_format:H:i'],
            'ends_at'            => ['required', 'date_format:H:i', 'after:starts_at'],
            'lesson_type_id'     => ['required', 'integer', 'exists:lesson_types,id'],
            'delivery_mode_id'   => ['required', 'integer', 'exists:delivery_modes,id'],
            'location_text'      => ['nullable', 'string', 'max:255'],
            'note'               => ['nullable', 'string'],
            'recurrence_rule_id' => ['required', 'integer', 'exists:recurrence_rules,id'],
            'active_from'        => ['required', 'date'],
            'active_to'          => ['nullable', 'date', 'after_or_equal:active_from'],
        ];
    }
}
