import type { ReactNode } from "react";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

import { fetchUserSettings } from "@/entities/user/api/settings/fetch-user-settings";
import { userSettingsStore } from "@/entities/user/model/settings/settings-store";
import { mapUiSettings } from "@/entities/user/lib/settings/map-ui-settings";
import { applyDomSettings } from "@/entities/user/lib/settings/apply-dom-settings";
import { loadCachedUiSettings, saveCachedUiSettings } from "@/entities/user/lib/settings/settings-cache";

type Props = {
    children: ReactNode;
};

export function SettingsProvider({ children }: Props) {
    useEffect(() => {
        const cached = loadCachedUiSettings();
        if (cached) applyDomSettings(cached);
    }, []);

    const mutation = useMutation({
        mutationFn: fetchUserSettings,
        onSuccess: (items) => {
            const ui = mapUiSettings(items);

            userSettingsStore.setAll({ ui, items });
            saveCachedUiSettings(ui);
            applyDomSettings(ui);
        },
        onError: () => {
            userSettingsStore.setReady(true);
        },
    });

    useEffect(() => {
        mutation.mutate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}