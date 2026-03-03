<?php

namespace App\Models\Schedule;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'teacher_name',
        'color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(ScheduleLesson::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(ExamEvent::class);
    }
}
