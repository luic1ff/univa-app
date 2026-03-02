<?php

namespace App\Http\Controllers\Account;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ChangePasswordRequest;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    public function update(ChangePasswordRequest $request)
    {
        $request->user()->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Пароль успішно змінено.',
        );
    }
}
