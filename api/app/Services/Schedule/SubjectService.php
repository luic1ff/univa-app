<?php

namespace App\Services\Schedule;

use App\Core\UnivaHttpException;
use App\Models\Schedule\Subject;

class SubjectService
{
    /** @return Subject[] */
    public function listForUser(int $userId): array
    {
        return Subject::query()
            ->where('user_id', $userId)
            ->orderBy('name')
            ->get()
            ->all();
    }

    /** @throws UnivaHttpException */
    public function create(int $userId, array $data): Subject
    {
        return Subject::create([
            'user_id'      => $userId,
            'name'         => $data['name'],
            'teacher_name' => $data['teacher_name'] ?? null,
            'color'        => $data['color'] ?? null,
        ]);
    }

    /** @throws UnivaHttpException */
    public function update(Subject $subject, array $data): Subject
    {
        $subject->update(array_filter([
            'name'         => $data['name'] ?? $subject->name,
            'teacher_name' => array_key_exists('teacher_name', $data) ? $data['teacher_name'] : $subject->teacher_name,
            'color'        => array_key_exists('color', $data) ? $data['color'] : $subject->color,
        ], fn ($v) => true));

        return $subject->fresh();
    }

    public function delete(Subject $subject): void
    {
        $subject->delete();
    }
}
