<?php

namespace App\Models\Application\Settings;

use App\Core\Traits\HasInsertWithId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSetting extends Model
{
    use HasInsertWithId, SoftDeletes;

    protected $fillable = [
        'group_id',
        'key',
        'type',
        'label',
        'description',
        'constraints',
        'default_setting_value_id',
    ];

    protected $casts = [
        'constraints' => 'array',
    ];

    public const EMAIL_NOTIFICATION_SETTING_ID = 1;
    public const EMAIL_NOTIFICATION_SETTING_KEY = 'email_notification';
    public const WEEKLY_DIGEST_SETTING_ID = 2;
    public const WEEKLY_DIGEST_SETTING_KEY = 'weekly_digest';
    public const PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_ID = 3;
    public const PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_KEY = 'push_notifications';
    public const SOUND_NOTIFICATIONS_SETTING_ID = 4;
    public const SOUND_NOTIFICATIONS_SETTING_KEY = 'sound_notifications';
    public const APPEARANCE_THEME_SETTING_ID = 5;
    public const APPEARANCE_THEME_SETTING_KEY = 'theme';
    public const APPEARANCE_LANGUAGE_SETTING_ID = 6;
    public const APPEARANCE_LANGUAGE_SETTING_KEY = 'language';
    public const APPEARANCE_COMPACT_MODE_SETTING_ID = 7;
    public const APPEARANCE_COMPACT_MODE_SETTING_KEY = 'compact_mode';
    public const APPEARANCE_ANIMATIONS_SETTING_ID = 8;
    public const APPEARANCE_ANIMATIONS_SETTING_KEY = 'animations';
    public const PRIVACY_PROFILE_SETTING_ID = 9;
    public const PRIVACY_PROFILE_SETTING_KEY = 'privacy_profile';
    public const PRIVACY_ONLINE_STATUS_SETTING_ID = 10;
    public const PRIVACY_ONLINE_STATUS_SETTING_KEY = 'online_status';

    public function group(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingGroup::class, 'group_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(ApplicationSettingValue::class, 'application_setting_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function defaultValue(): BelongsTo
    {
        return $this->belongsTo(ApplicationSettingValue::class, 'default_setting_value_id');
    }
}
