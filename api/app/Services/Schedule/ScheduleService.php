<?php

namespace App\Services\Schedule;

use App\Core\UnivaHttpException;
use App\Core\Response\ResponseState;
use App\Models\Schedule\ScheduleLesson;
use App\Models\Schedule\ScheduleLessonException;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ScheduleService
{
    // -------------------------------------------------------------------------
    // Public: Build schedule for date range
    // -------------------------------------------------------------------------

    /**
     * Build a list of lesson instances for a user within a date range.
     * Applies recurrence rules and exception overrides.
     *
     * @return array<array{
     *   id: int,
     *   lesson_id: int,
     *   date: string,
     *   starts_at: string,
     *   ends_at: string,
     *   subject: array,
     *   lesson_type: array,
     *   delivery_mode: array,
     *   location: string|null,
     *   note: string|null,
     *   source: string,
     * }>
     */
    public function buildForRange(int $userId, Carbon $from, Carbon $to): array
    {
        // 1. Load all active lessons with their exceptions and relations
        $lessons = ScheduleLesson::query()
            ->where('user_id', $userId)
            ->where('active_from', '<=', $to->toDateString())
            ->where(function ($q) use ($from) {
                $q->whereNull('active_to')
                  ->orWhere('active_to', '>=', $from->toDateString());
            })
            ->with([
                'subject',
                'lessonType',
                'deliveryMode',
                'recurrenceRule',
                'exceptions' => fn ($q) => $q
                    ->whereBetween('date', [$from->toDateString(), $to->toDateString()]),
            ])
            ->get();

        // 2. Index exceptions keyed by lesson_id → date string
        $instances = [];

        foreach ($lessons as $lesson) {
            $exceptionsByDate = $lesson->exceptions->keyBy(
                fn ($ex) => $ex->date->toDateString()
            );

            // Iterate every day in the range
            $period = CarbonPeriod::create($from, $to);
            foreach ($period as $day) {
                // Does this lesson recur on this weekday?
                if (! $this->occursOn($lesson, $day)) {
                    continue;
                }

                $dateStr = $day->toDateString();
                $exception = $exceptionsByDate->get($dateStr);

                // Skip if cancelled
                if ($exception && $exception->action === 'cancelled') {
                    continue;
                }

                $instances[] = $this->buildInstance($lesson, $day, $exception);
            }
        }

        // Sort by date, then time
        usort($instances, function ($a, $b) {
            $cmp = strcmp($a['date'], $b['date']);
            return $cmp !== 0 ? $cmp : strcmp($a['starts_at'], $b['starts_at']);
        });

        return $instances;
    }

    // -------------------------------------------------------------------------
    // Public: Store / Update / Exception
    // -------------------------------------------------------------------------

    /** @throws UnivaHttpException */
    public function storeLesson(int $userId, array $data): ScheduleLesson
    {
        $this->assertNoConflict($userId, $data);

        return ScheduleLesson::create(array_merge($data, ['user_id' => $userId]));
    }

    /** @throws UnivaHttpException */
    public function updateLesson(ScheduleLesson $lesson, array $data): ScheduleLesson
    {
        $merged = array_merge($lesson->toArray(), $data);
        $this->assertNoConflict($lesson->user_id, $merged, $lesson->id);

        $lesson->update($data);
        return $lesson->fresh([
            'subject', 'lessonType', 'deliveryMode', 'recurrenceRule',
        ]);
    }

    /** @throws UnivaHttpException */
    public function storeException(ScheduleLesson $lesson, array $data): ScheduleLessonException
    {
        // Check if an exception for this date already exists
        $existing = ScheduleLessonException::query()
            ->where('schedule_lesson_id', $lesson->id)
            ->where('date', $data['date'])
            ->first();

        if ($existing) {
            throw new UnivaHttpException(
                'An exception for this date already exists.',
                ResponseState::Unprocessable
            );
        }

        return ScheduleLessonException::create(
            array_merge($data, ['schedule_lesson_id' => $lesson->id])
        );
    }

    public function deleteException(ScheduleLessonException $exception): void
    {
        $exception->delete();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /** Does this lesson rule fire on the given calendar day? */
    private function occursOn(ScheduleLesson $lesson, Carbon $day): bool
    {
        // Carbon dayOfWeek: 0=Sun, 1=Mon… → we store 1=Mon,7=Sun (ISO)
        $isoDow = $day->isoWeekday(); // 1=Mon … 7=Sun

        if ($lesson->weekday !== $isoDow) {
            return false;
        }

        // Check active_from / active_to
        if ($day->lt($lesson->active_from)) {
            return false;
        }
        if ($lesson->active_to && $day->gt($lesson->active_to)) {
            return false;
        }

        // Recurrence rule
        $rule = $lesson->recurrenceRule;
        if ($rule->code === 'weekly') {
            return true;
        }

        if ($rule->code === 'biweekly_even' || $rule->code === 'biweekly_odd') {
            $weekNumber = $day->weekOfYear;
            $isEven = ($weekNumber % 2) === 0;
            return $rule->code === 'biweekly_even' ? $isEven : !$isEven;
        }

        // For 'custom' or unknown — show every week by default
        return true;
    }

    /** Build a lesson instance array from a rule, date, and optional exception. */
    private function buildInstance(ScheduleLesson $lesson, Carbon $day, ?ScheduleLessonException $ex): array
    {
        $subject = $lesson->subject;

        if ($ex && in_array($ex->action, ['rescheduled', 'modified'], true)) {
            return [
                'id'            => $ex->id,
                'lesson_id'     => $lesson->id,
                'date'          => $day->toDateString(),
                'starts_at'     => $ex->override_starts_at ?? $lesson->starts_at,
                'ends_at'       => $ex->override_ends_at   ?? $lesson->ends_at,
                'subject'       => $this->formatSubject($subject),
                'lesson_type'   => $this->formatLessonType($lesson->lessonType),
                'delivery_mode' => $this->formatDeliveryMode($lesson->deliveryMode),
                'location'      => $ex->override_location_text ?? $lesson->location_text,
                'note'          => $lesson->note,
                'source'        => 'exception',
            ];
        }

        return [
            'id'            => $lesson->id,
            'lesson_id'     => $lesson->id,
            'date'          => $day->toDateString(),
            'starts_at'     => $lesson->starts_at,
            'ends_at'       => $lesson->ends_at,
            'subject'       => $this->formatSubject($subject),
            'lesson_type'   => $this->formatLessonType($lesson->lessonType),
            'delivery_mode' => $this->formatDeliveryMode($lesson->deliveryMode),
            'location'      => $lesson->location_text,
            'note'          => $lesson->note,
            'source'        => 'rule',
        ];
    }

    /** @throws UnivaHttpException */
    private function assertNoConflict(int $userId, array $data, ?int $excludeId = null): void
    {
        $query = ScheduleLesson::query()
            ->where('user_id', $userId)
            ->where('weekday', $data['weekday'])
            // time overlap: starts_at < other.ends_at AND ends_at > other.starts_at
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            // active period overlap
            ->where('active_from', '<=', $data['active_to'] ?? '9999-12-31')
            ->where(function ($q) use ($data) {
                $q->whereNull('active_to')
                  ->orWhere('active_to', '>=', $data['active_from']);
            });

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new UnivaHttpException(
                'This lesson overlaps with another lesson on the same day.',
                ResponseState::Unprocessable
            );
        }
    }

    private function formatSubject($subject): array
    {
        return [
            'id'           => $subject->id,
            'name'         => $subject->name,
            'teacher_name' => $subject->teacher_name,
            'color'        => $subject->color,
        ];
    }

    private function formatLessonType($type): array
    {
        return [
            'id'    => $type->id,
            'code'  => $type->code,
            'name'  => $type->name,
            'color' => $type->color,
        ];
    }

    private function formatDeliveryMode($mode): array
    {
        return [
            'id'   => $mode->id,
            'code' => $mode->code,
            'name' => $mode->name,
        ];
    }
}
