<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreExceptionRequest;
use App\Models\Schedule\ScheduleLesson;
use App\Models\Schedule\ScheduleLessonException;
use App\Services\Schedule\ScheduleService;
use Illuminate\Http\JsonResponse;

class ScheduleExceptionController extends Controller
{
    public function __construct(
        private readonly ScheduleService $service,
    ) {}

    public function store(StoreExceptionRequest $request, ScheduleLesson $lesson): JsonResponse
    {
        // Only owner can add exceptions
        $this->authorize('update', $lesson);

        try {
            $exception = $this->service->storeException($lesson, $request->validated());
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return ApiResponse::created('Exception created.', $exception);
    }

    public function destroy(ScheduleLessonException $exception): JsonResponse
    {
        // Ensure the owner owns the parent lesson
        $this->authorize('update', $exception->lesson);

        $this->service->deleteException($exception);

        return ApiResponse::ok('Exception deleted.');
    }
}
