<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Schedule\ExamEventService;
use App\Services\Schedule\ScheduleService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        private readonly ScheduleService  $scheduleService,
        private readonly ExamEventService $examService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['required', 'date'],
            'to'   => ['required', 'date', 'after_or_equal:from'],
        ]);

        $userId = (int) auth()->id();
        $from   = Carbon::parse($request->query('from'))->startOfDay();
        $to     = Carbon::parse($request->query('to'))->endOfDay();

        $lessons = $this->scheduleService->buildForRange($userId, $from, $to);

        $exams = $this->examService->listForUser(
            $userId,
            $from->toDateString(),
            $to->toDateString()
        );

        $examInstances = array_map(function ($exam) {
            return [
                'id'            => $exam->id,
                'lesson_id'     => null,
                'date'          => Carbon::parse($exam->starts_at)->toDateString(),
                'starts_at'     => Carbon::parse($exam->starts_at)->format('H:i'),
                'ends_at'       => $exam->ends_at ? Carbon::parse($exam->ends_at)->format('H:i') : null,
                'subject'       => [
                    'id'           => $exam->subject->id,
                    'name'         => $exam->subject->name,
                    'teacher_name' => $exam->subject->teacher_name,
                    'color'        => $exam->subject->color,
                ],
                'exam_type'     => [
                    'id'   => $exam->examType->id,
                    'code' => $exam->examType->code,
                    'name' => $exam->examType->name,
                ],
                'lesson_type'   => null,
                'delivery_mode' => null,
                'location'      => $exam->location_text,
                'note'          => $exam->note,
                'source'        => 'exam',
            ];
        }, $exams);

        $all = array_merge($lessons, $examInstances);
        usort($all, fn ($a, $b) => strcmp($a['date'] . $a['starts_at'], $b['date'] . $b['starts_at']));

        return ApiResponse::ok('Schedule retrieved.', $all);
    }
}
