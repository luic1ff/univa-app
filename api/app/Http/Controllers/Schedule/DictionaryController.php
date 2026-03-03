<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Schedule\DeliveryMode;
use App\Models\Schedule\ExamType;
use App\Models\Schedule\LessonType;
use App\Models\Schedule\RecurrenceRule;
use Illuminate\Http\JsonResponse;

class DictionaryController extends Controller
{
    public function lessonTypes(): JsonResponse
    {
        return ApiResponse::ok('Lesson types retrieved.', LessonType::all());
    }

    public function deliveryModes(): JsonResponse
    {
        return ApiResponse::ok('Delivery modes retrieved.', DeliveryMode::all());
    }

    public function examTypes(): JsonResponse
    {
        return ApiResponse::ok('Exam types retrieved.', ExamType::all());
    }

    public function recurrenceRules(): JsonResponse
    {
        return ApiResponse::ok('Recurrence rules retrieved.', RecurrenceRule::all());
    }
}
