<?php

namespace App\Http\Controllers\Account;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], [
            'avatar.required' => 'Оберіть зображення.',
            'avatar.image'    => 'Файл має бути зображенням.',
            'avatar.mimes'    => 'Допустимі формати: JPG, PNG, WebP.',
            'avatar.max'      => 'Максимальний розмір файлу — 2MB.',
        ]);

        $user = $request->user();

        // Delete the old avatar if exists
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Store the new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar_path' => $path]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Аватар успішно оновлено.',
            data: UserResource::make($user->fresh()),
        );
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->update(['avatar_path' => null]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Аватар видалено.',
            data: UserResource::make($user->fresh()),
        );
    }
}
