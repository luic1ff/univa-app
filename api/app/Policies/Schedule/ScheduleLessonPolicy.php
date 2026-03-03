<?php

namespace App\Policies\Schedule;

use App\Models\Schedule\ScheduleLesson;
use App\Models\User;

class ScheduleLessonPolicy
{
    public function update(User $user, ScheduleLesson $lesson): bool
    {
        return $user->id === $lesson->user_id;
    }

    public function delete(User $user, ScheduleLesson $lesson): bool
    {
        return $user->id === $lesson->user_id;
    }
}
