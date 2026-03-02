<?php

use App\Http\Controllers\Account\AvatarController;
use App\Http\Controllers\Account\PasswordController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Settings\SettingsController;
use App\Http\Controllers\System\HealthController;
use App\Http\Controllers\System\User\MeController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth:sanctum', 'throttle:api', 'web'], 'prefix' => '/v1'], function () {

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
});

Route::group(['prefix' => '/v1', 'middleware' => ['web']], function () {
    Route::get('/health', [HealthController::class, 'health']);

    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/login', [LoginController::class, 'store']);
});
