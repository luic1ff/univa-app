<?php

namespace App\Http\Controllers\System\User;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Http\Resources\Settings\SelectedSettingResource;
use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationUserSetting;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;

class MeController extends Controller
{
    public function user(): JsonResponse
    {
        $user = auth()->user();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: UserResource::make($user),
        );
    }

    /**
     * @throws UnivaHttpException
     */
    public function settings(): JsonResponse
    {
        $settings = ApplicationUserSetting::query()
            ->with(['setting', 'value'])
            ->where('user_id', auth()->id())
            ->get();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: SelectedSettingResource::collection($settings),
        );
    }
}
