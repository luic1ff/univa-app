<?php

use App\Http\Controllers\Account\AvatarController;
use App\Http\Controllers\Account\PasswordController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Schedule\DictionaryController;
use App\Http\Controllers\Schedule\ExamEventController;
use App\Http\Controllers\Schedule\ScheduleController;
use App\Http\Controllers\Schedule\ScheduleExceptionController;
use App\Http\Controllers\Schedule\ScheduleLessonController;
use App\Http\Controllers\Schedule\SubjectController;
use App\Http\Controllers\Settings\SettingsController;
use App\Http\Controllers\System\HealthController;
use App\Http\Controllers\System\User\MeController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth:sanctum', 'throttle:api', 'web'], 'prefix' => '/v1'], function () {

    // ── Account ───────────────────────────────────────────────────────────────
    Route::group(['prefix' => '/me'], function () {
        Route::get('/univa-user', [MeController::class, 'user']);
        Route::get('/settings', [MeController::class, 'settings']);
        Route::patch('/profile', [ProfileController::class, 'update']);
        Route::post('/password', [PasswordController::class, 'update']);
        Route::post('/avatar', [AvatarController::class, 'update']);
        Route::delete('/avatar', [AvatarController::class, 'destroy']);
    });

    Route::post('/logout', [LogoutController::class, 'store']);

    Route::get('/settings', [SettingsController::class, 'index']);
    Route::patch('/settings', [SettingsController::class, 'bulkUpdate']);
    Route::patch('/settings/{key}', [SettingsController::class, 'update'])
        ->where('key', '.+');

    // ── Schedule module ───────────────────────────────────────────────────────

    // Built schedule (lessons + exams merged)
    Route::get('/schedule', [ScheduleController::class, 'index']);

    // Subjects
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::patch('/subjects/{subject}', [SubjectController::class, 'update']);
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

    // Schedule lesson rules
    Route::post('/schedule-lessons', [ScheduleLessonController::class, 'store']);
    Route::patch('/schedule-lessons/{lesson}', [ScheduleLessonController::class, 'update']);
    Route::delete('/schedule-lessons/{lesson}', [ScheduleLessonController::class, 'destroy']);

    // Exceptions
    Route::post('/schedule-lessons/{lesson}/exceptions', [ScheduleExceptionController::class, 'store']);
    Route::delete('/exceptions/{exception}', [ScheduleExceptionController::class, 'destroy']);

    // Exam events
    Route::get('/exams', [ExamEventController::class, 'index']);
    Route::post('/exams', [ExamEventController::class, 'store']);
    Route::patch('/exams/{exam}', [ExamEventController::class, 'update']);
    Route::delete('/exams/{exam}', [ExamEventController::class, 'destroy']);
});

Route::group(['prefix' => '/v1', 'middleware' => ['web']], function () {
    Route::get('/health', [HealthController::class, 'health']);

    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/login', [LoginController::class, 'store']);

    // ── Dictionaries (public, cacheable on frontend) ──────────────────────────
    Route::get('/dictionaries/lesson-types', [DictionaryController::class, 'lessonTypes']);
    Route::get('/dictionaries/delivery-modes', [DictionaryController::class, 'deliveryModes']);
    Route::get('/dictionaries/exam-types', [DictionaryController::class, 'examTypes']);
    Route::get('/dictionaries/recurrence-rules', [DictionaryController::class, 'recurrenceRules']);
});
