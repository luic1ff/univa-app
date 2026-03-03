<?php

namespace App\Services\Schedule;

use App\Core\UnivaHttpException;
use App\Models\Schedule\ExamEvent;

class ExamEventService
{
    /** @return ExamEvent[] */
    public function listForUser(int $userId, string $from, string $to): array
    {
        return ExamEvent::query()
            ->where('user_id', $userId)
            ->whereBetween('starts_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->with(['subject', 'examType'])
            ->orderBy('starts_at')
            ->get()
            ->all();
    }

    /** @throws UnivaHttpException */
    public function create(int $userId, array $data): ExamEvent
    {
        return ExamEvent::create([
            'user_id'       => $userId,
            'subject_id'    => $data['subject_id'],
            'exam_type_id'  => $data['exam_type_id'],
            'starts_at'     => $data['starts_at'],
            'ends_at'       => $data['ends_at'] ?? null,
            'location_text' => $data['location_text'] ?? null,
            'note'          => $data['note'] ?? null,
        ]);
    }

    /** @throws UnivaHttpException */
    public function update(ExamEvent $event, array $data): ExamEvent
    {
        $event->update([
            'subject_id'    => $data['subject_id']    ?? $event->subject_id,
            'exam_type_id'  => $data['exam_type_id']  ?? $event->exam_type_id,
            'starts_at'     => $data['starts_at']     ?? $event->starts_at,
            'ends_at'       => $data['ends_at']       ?? $event->ends_at,
            'location_text' => array_key_exists('location_text', $data) ? $data['location_text'] : $event->location_text,
            'note'          => array_key_exists('note', $data) ? $data['note'] : $event->note,
        ]);

        return $event->fresh(['subject', 'examType']);
    }

    public function delete(ExamEvent $event): void
    {
        $event->delete();
    }
}
