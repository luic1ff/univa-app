<?php

namespace App\Models\Schedule;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduleLesson extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'subject_id',
        'weekday',
        'starts_at',
        'ends_at',
        'lesson_type_id',
        'delivery_mode_id',
        'location_text',
        'note',
        'recurrence_rule_id',
        'active_from',
        'active_to',
    ];

    protected $casts = [
        'weekday'     => 'integer',
        'active_from' => 'date',
        'active_to'   => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function lessonType(): BelongsTo
    {
        return $this->belongsTo(LessonType::class);
    }

    public function deliveryMode(): BelongsTo
    {
        return $this->belongsTo(DeliveryMode::class);
    }

    public function recurrenceRule(): BelongsTo
    {
        return $this->belongsTo(RecurrenceRule::class);
    }

    public function exceptions(): HasMany
    {
        return $this->hasMany(ScheduleLessonException::class);
    }
}
