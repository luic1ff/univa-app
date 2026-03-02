import type { UserSettings } from "./types";
import type { UserSettingItem } from "@/entities/user/api/settings/types";

type Listener = () => void;

export interface SettingsState {
    ui: UserSettings | null;        // тільки те, що потрібно для DOM/UI
    items: UserSettingItem[];       // повний список з API
    isReady: boolean;               // бек завантажився (або впав)
}

let state: SettingsState = {
    ui: null,
    items: [],
    isReady: false,
};

const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((fn) => fn());
}

export const userSettingsStore = {
    getState(): Readonly<SettingsState> {
        return state;
    },

    setAll(payload: { ui: UserSettings; items: UserSettingItem[] }) {
        state = { ...state, ui: payload.ui, items: payload.items, isReady: true };
        notify();
    },

    setReady(isReady: boolean) {
        state = { ...state, isReady };
        notify();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};