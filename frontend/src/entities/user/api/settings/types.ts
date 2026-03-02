export type UserSettingItem = {
    id: number;

    setting: {
        id: number;
        key: string;
        type: string;
        label?: string;
        description?: string | null;
        defaultValueId?: number | null;
    };

    value: {
        id: number;
        value: string;
        label?: string;
        meta?: unknown;
    };
};

export type UserSettingsApiResponse = UserSettingItem[];