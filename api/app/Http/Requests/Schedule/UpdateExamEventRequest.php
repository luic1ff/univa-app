<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamEventRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_id'    => ['sometimes', 'integer', 'exists:subjects,id'],
            'exam_type_id'  => ['sometimes', 'integer', 'exists:exam_types,id'],
            'starts_at'     => ['sometimes', 'date_format:Y-m-d H:i'],
            'ends_at'       => ['nullable', 'date_format:Y-m-d H:i'],
            'location_text' => ['nullable', 'string', 'max:255'],
            'note'          => ['nullable', 'string'],
        ];
    }
}
