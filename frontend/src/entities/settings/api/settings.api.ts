import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SettingValue {
    id: number;
    value: string;
    label: string;
    meta: Record<string, unknown> | null;
}

export interface SettingItem {
    id: number;
    group_id: number;
    key: string;
    type: "bool" | "int" | "string" | "json" | "enum";
    label: string;
    description: string | null;
    constraints: Record<string, unknown> | null;
    /** The currently active value id (user override or default) */
    selected_value_id: number | null;
    /** All allowed values for this setting */
    values: SettingValue[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the current string value for a setting item.
 * Falls back to the first available value if nothing is selected.
 */
export function getSelectedValue(item: SettingItem): string {
    if (item.selected_value_id !== null) {
        const found = item.values.find(v => v.id === item.selected_value_id);
        if (found) return found.value;
    }
    return item.values[0]?.value ?? "";
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch all settings for a given group ID.
 */
export async function fetchSettingsGroup(groupId: number): Promise<SettingItem[]> {
    return apiFetch<SettingItem[]>(ENDPOINTS.settings.group(groupId));
}

/**
 * Update a single setting value by key.
 */
export async function updateSetting(key: string, value: unknown): Promise<void> {
    await apiFetch<void>(ENDPOINTS.settings.update(key), {
        method: "PATCH",
        body: JSON.stringify({ value }),
    });
}

/**
 * Bulk-update multiple settings in a single HTTP request.
 * Sends PATCH /settings with { settings: [{key, value}, ...] }
 */
export async function bulkUpdateSettings(
    pairs: Array<{ key: string; value: string }>
): Promise<void> {
    await apiFetch<void>(ENDPOINTS.settings.bulk, {
        method: "PATCH",
        body: JSON.stringify({ settings: pairs }),
    });
}
