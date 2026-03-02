import type { UserSettings } from "@/entities/user/model/settings/types";

const LS_KEY = "univa:userSettings:v1";

export function loadCachedUiSettings(): UserSettings | null {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<UserSettings>;
        if (!parsed || typeof parsed !== "object") return null;

        return parsed as UserSettings;
    } catch {
        return null;
    }
}

export function saveCachedUiSettings(settings: UserSettings) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(settings));
    } catch {
        // ignore
    }
}