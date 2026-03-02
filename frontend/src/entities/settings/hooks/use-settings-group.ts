import { useQuery } from "@tanstack/react-query";
import { fetchSettingsGroup, getSelectedValue, type SettingItem } from "@/entities/settings/api/settings.api";
import { useAuth } from "@/app/providers/auth-provider";

/**
 * Fetches settings for a specific group on demand (when the tab is opened).
 *
 * - Enabled only when the user is authenticated
 * - Cached by React Query: queryKey = ['settings', groupId]
 * - Stale time: 5 minutes (re-fetches in background if older)
 *
 * Usage:
 * ```tsx
 * const { data, isLoading } = useSettingsGroup(4) // Appearance
 * ```
 */
export function useSettingsGroup(groupId: number) {
    const { user } = useAuth();

    return useQuery<SettingItem[]>({
        queryKey: ["settings", groupId],
        queryFn: () => fetchSettingsGroup(groupId),
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 min — balance between freshness and reqs
        gcTime: 15 * 60 * 1000,   // 15 min — matches backend cache TTL
    });
}

/**
 * Convenience: find a single setting's current string value from a group response.
 *
 * Usage:
 * ```tsx
 * const theme = useSettingValue(data, "appearance.theme", "system")
 * ```
 */
export function useSettingValue(
    settings: SettingItem[] | undefined,
    key: string,
    defaultValue: string,
): string {
    if (!settings) return defaultValue;
    const item = settings.find((s) => s.key === key);
    if (!item) return defaultValue;
    return getSelectedValue(item) || defaultValue;
}
