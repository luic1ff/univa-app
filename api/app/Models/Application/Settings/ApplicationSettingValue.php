<?php

namespace App\Models\Application\Settings;

use App\Core\Traits\HasInsertWithId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicationSettingValue extends Model
{
    use HasInsertWithId, SoftDeletes;

    protected $fillable = [
        'application_setting_id',
        'value',
        'label',
        'meta',
        'sort_order',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public const SETTING_ENABLED_VALUE_ID = 1;
    public const SETTING_ENABLED_VALUE = 1;
    public const SETTING_DISABLED_VALUE_ID = 2;
    public const SETTING_DISABLED_VALUE = 0;

    public const SETTING_APPEARANCE_LIGHT_VALUE_ID = 3;
    public const SETTING_APPEARANCE_LIGHT_VALUE = 'light';
    public const SETTING_APPEARANCE_DARK_VALUE_ID = 4;
    public const SETTING_APPEARANCE_DARK_VALUE = 'dark';
    public const SETTING_APPEARANCE_SYSTEM_VALUE_ID = 5;
    public const SETTING_APPEARANCE_SYSTEM_VALUE = 'system';
    public const SETTING_APPEARANCE_LANGUAGE_UA_VALUE_ID = 6;
    public const SETTING_APPEARANCE_LANGUAGE_UA_VALUE = 'ua';
    public const SETTING_APPEARANCE_LANGUAGE_EN_VALUE_ID = 7;
    public const SETTING_APPEARANCE_LANGUAGE_EN_VALUE = 'en';
    public const SETTING_APPEARANCE_LANGUAGE_PL_VALUE_ID = 8;
    public const SETTING_APPEARANCE_LANGUAGE_PL_VALUE = 'pl';

    public const SETTING_PRIVACY_PROFILE_PUBLIC_VALUE_ID = 9;
    public const SETTING_PRIVACY_PROFILE_PUBLIC_VALUE = 'profile_public';
    public const SETTING_PRIVACY_PROFILE_FRIENDS_ID = 10;
    public const SETTING_PRIVACY_PROFILE_FRIENDS = 'profile_friends';
    public const SETTING_PRIVACY_PROFILE_PRIVATE_VALUE_ID = 11;
    public const SETTING_PRIVACY_PROFILE_PRIVATE_VALUE = 'profile_private';
    public const SETTING_DANDER_ZONE_DEACTIVATE_ACCOUNT_VALUE_ID = 12;

    public const SETTING_DANDER_ZONE_DEACTIVATE_ACCOUNT_VALUE = 'deactivate_account';
    public const SETTING_DANDER_ZONE_CLEAR_DATA_VALUE_ID = 13;
    public const SETTING_DANDER_ZONE_CLEAR_DATA_VALUE = 'clear_data';
    public const SETTING_DANDER_ZONE_DELETE_ACCOUNT_VALUE_ID = 14;
    public const SETTING_DANDER_ZONE_DELETE_ACCOUNT_VALUE = 'delete_account';
}
