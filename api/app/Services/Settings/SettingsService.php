<?php

namespace App\Services\Settings;

use App\Core\UnivaHttpException;
use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationSettingValue;
use App\Models\Application\Settings\ApplicationUserSetting;

class SettingsService
{
    /**
     * @throws UnivaHttpException
     */
    public function getValueId(int $userId, int $settingId): int
    {
        $setting = ApplicationSetting::query()
            ->select(['id', 'default_setting_value_id'])
            ->find($settingId);

        if (! $setting) {
            throw new UnivaHttpException('Setting not found');
        }

        $userValueId = ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->where('application_setting_id', $settingId)
            ->value('application_setting_value_id');

        $effective = $userValueId ?? $setting->default_setting_value_id;

        if ($effective === null) {
            throw new UnivaHttpException('Setting value not set');
        }

        return (int) $effective;
    }

    public function getUserValueId(int $userId, int $settingId): ?int
    {
        $valueId = ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->where('application_setting_id', $settingId)
            ->value('application_setting_value_id');

        return $valueId !== null ? (int) $valueId : null;
    }

    /**
     * @throws UnivaHttpException
     */
    public function setValueId(int $userId, int $settingId, int $valueId): void
    {
        if (! ApplicationSetting::query()->whereKey($settingId)->exists()) {
            throw new UnivaHttpException('Setting not found');
        }

        $belongs = ApplicationSettingValue::query()
            ->where('id', $valueId)
            ->where('application_setting_id', $settingId)
            ->exists();

        if (! $belongs) {
            throw new UnivaHttpException('Setting value does not belong to this setting');
        }

        ApplicationUserSetting::query()->updateOrCreate(
            ['user_id' => $userId, 'application_setting_id' => $settingId],
            ['application_setting_value_id' => $valueId]
        );
    }

    /**
     * @throws UnivaHttpException
     */
    public function resetToDefault(int $userId, int $settingId): void
    {
        if (! ApplicationSetting::query()->whereKey($settingId)->exists()) {
            throw new UnivaHttpException('Setting not found');
        }

        ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->where('application_setting_id', $settingId)
            ->delete();
    }

    /**
     * @throws UnivaHttpException
     */
    public function setForUser(int $userId, string $key, string $value): void
    {
        $setting = ApplicationSetting::query()
            ->select(['id', 'key'])
            ->where('key', $key)
            ->first();

        if (! $setting) {
            throw new UnivaHttpException('Setting not found');
        }

        $settingValue = ApplicationSettingValue::query()
            ->select(['id'])
            ->where('application_setting_id', $setting->id)
            ->where('value', $value)
            ->first();

        if (! $settingValue) {
            throw new UnivaHttpException('Invalid value for this setting');
        }

        ApplicationUserSetting::query()->updateOrCreate(
            ['user_id' => $userId, 'application_setting_id' => $setting->id],
            ['application_setting_value_id' => $settingValue->id]
        );
    }

    /**
     * Bulk-update multiple settings for a user in one call.
     * Validates all entries first, then persists them.
     *
     * @param  int                          $userId
     * @param  array<array{key:string,value:string}>  $pairs
     *
     * @throws UnivaHttpException
     */
    public function bulkSetForUser(int $userId, array $pairs): void
    {
        // Load all referenced settings at once
        $keys = array_column($pairs, 'key');

        $settings = ApplicationSetting::query()
            ->whereIn('key', $keys)
            ->get()
            ->keyBy('key');

        // Build list of (settingId => valueId) to upsert
        $upserts = [];

        foreach ($pairs as $pair) {
            $setting = $settings->get($pair['key']);

            if (! $setting) {
                throw new UnivaHttpException("Setting not found: {$pair['key']}");
            }

            $settingValue = ApplicationSettingValue::query()
                ->select(['id'])
                ->where('application_setting_id', $setting->id)
                ->where('value', $pair['value'])
                ->first();

            if (! $settingValue) {
                throw new UnivaHttpException("Invalid value '{$pair['value']}' for setting '{$pair['key']}'");
            }

            $upserts[] = [
                'setting_id' => $setting->id,
                'value_id'   => $settingValue->id,
            ];
        }

        // Persist all validated pairs
        foreach ($upserts as $u) {
            ApplicationUserSetting::query()->updateOrCreate(
                ['user_id' => $userId, 'application_setting_id' => $u['setting_id']],
                ['application_setting_value_id' => $u['value_id']]
            );
        }
    }

    /**
     * @throws UnivaHttpException
     */
    public function getGroupForUser(int $groupId, int $userId): array
    {
        $settings = ApplicationSetting::query()
            ->where('group_id', $groupId)
            ->with([
                'values',
                'defaultValue',
            ])
            ->orderBy('id')
            ->get();

        if ($settings->isEmpty()) {
            throw new UnivaHttpException('Group not found or has no settings');
        }

        $settingIds = $settings->pluck('id')->all();

        $userSettings = ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->whereIn('application_setting_id', $settingIds)
            ->get()
            ->keyBy('application_setting_id');

        return $settings->map(function (ApplicationSetting $s) use ($userSettings) {
            $userRow = $userSettings->get($s->id);

            $selectedValueId = $userRow?->application_setting_value_id ?? $s->default_setting_value_id;

            $rawValue = $userRow?->raw_value;

            if ($selectedValueId !== null && $s->values->isNotEmpty()) {
                $allowedIds = $s->values->pluck('id')->all();
                if (!in_array($selectedValueId, $allowedIds, true)) {
                    $selectedValueId = $s->default_setting_value_id;
                }
            }

            return [
                'id' => $s->id,
                'group_id' => $s->group_id,
                'key' => $s->key,
                'type' => $s->type,
                'label' => $s->label,
                'description' => $s->description,
                'constraints' => $s->constraints,

                'selected_value_id' => $selectedValueId,
                'raw_value' => $rawValue,

                'values' => $s->values->map(fn (ApplicationSettingValue $v) => [
                    'id' => $v->id,
                    'value' => $v->value,
                    'label' => $v->label,
                    'meta' => $v->meta,
                    'sort_order' => $v->sort_order ?? 0,
                ])->values()->all(),
            ];
        })->values()->all();
    }
}
