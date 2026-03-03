<?php

namespace App\Policies\Schedule;

use App\Models\Schedule\ExamEvent;
use App\Models\User;

class ExamEventPolicy
{
    public function update(User $user, ExamEvent $event): bool
    {
        return $user->id === $event->user_id;
    }

    public function delete(User $user, ExamEvent $event): bool
    {
        return $user->id === $event->user_id;
    }
}
