<?php

namespace App\Models\Schedule;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleLessonException extends Model
{
    protected $fillable = [
        'schedule_lesson_id',
        'date',
        'action',
        'override_starts_at',
        'override_ends_at',
        'override_location_text',
        'override_teacher',
        'override_subject_id',
        'reason',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(ScheduleLesson::class, 'schedule_lesson_id');
    }

    public function overrideSubject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'override_subject_id');
    }
}
