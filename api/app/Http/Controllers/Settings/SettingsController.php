<?php

namespace App\Http\Controllers\Settings;

use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BulkUpdateSettingsRequest;
use App\Http\Requests\Settings\UpdateSettingRequest;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $groupId = $request->query('group_id');

        if (! $groupId || ! is_numeric($groupId)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'group_id is required and must be a number.',
                'data'    => null,
            ], 422);
        }

        try {
            $settings = $this->settingsService->getGroupForUser(
                groupId: (int) $groupId,
                userId: (int) auth()->id(),
            );
        } catch (UnivaHttpException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'data'    => null,
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => null,
            'data'    => $settings,
        ]);
    }

    public function update(string $key, UpdateSettingRequest $request): JsonResponse
    {
        $decodedKey = urldecode($key);

        try {
            $this->settingsService->setForUser(
                userId: (int) auth()->id(),
                key: $decodedKey,
                value: (string) $request->input('value'),
            );
        } catch (UnivaHttpException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'data'    => null,
            ], 422);
        }

        return response()->json([
            'status'  => 'success',
            'message' => null,
            'data'    => null,
        ]);
    }

    public function bulkUpdate(BulkUpdateSettingsRequest $request): JsonResponse
    {
        try {
            $this->settingsService->bulkSetForUser(
                userId: (int) auth()->id(),
                pairs:  $request->input('settings'),
            );
        } catch (UnivaHttpException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'data'    => null,
            ], 422);
        }

        return response()->json([
            'status'  => 'success',
            'message' => null,
            'data'    => null,
        ]);
    }
}
