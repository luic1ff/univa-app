<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamEventRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_id'    => ['required', 'integer', 'exists:subjects,id'],
            'exam_type_id'  => ['required', 'integer', 'exists:exam_types,id'],
            'starts_at'     => ['required', 'date_format:Y-m-d H:i'],
            'ends_at'       => ['nullable', 'date_format:Y-m-d H:i', 'after:starts_at'],
            'location_text' => ['nullable', 'string', 'max:255'],
            'note'          => ['nullable', 'string'],
        ];
    }
}
