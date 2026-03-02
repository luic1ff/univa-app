<?php

namespace App\Http\Controllers\Account;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateProfileRequest;
use App\Http\Resources\Auth\UserResource;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();

        $user->update($request->validated());

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Профіль успішно оновлено.',
            data: UserResource::make($user->fresh()),
        );
    }
}
