import { useSyncExternalStore } from "react";
import { userSettingsStore } from "@/entities/user/model/settings/settings-store";
import { DEFAULT_UI_SETTINGS } from "@/entities/user/lib/settings/map-ui-settings";
import type { UserSettings } from "@/entities/user/model/settings/types";

/**
 * useUserSettings
 *
 * Returns the current UI settings from `userSettingsStore`, reactively
 * updating whenever the store changes (e.g., after saving settings).
 *
 * Usage:
 * ```tsx
 * const { compact, animations, theme } = useUserSettings()
 * ```
 */
export function useUserSettings(): UserSettings {
    const ui = useSyncExternalStore(
        userSettingsStore.subscribe,
        () => userSettingsStore.getState().ui,
        () => null, // SSR snapshot — not used in this app
    );
    return ui ?? DEFAULT_UI_SETTINGS;
}
