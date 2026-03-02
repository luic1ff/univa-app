import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { UserSettingsApiResponse } from "./types";

export async function fetchUserSettings(): Promise<UserSettingsApiResponse> {
    return apiFetch<UserSettingsApiResponse>(ENDPOINTS.settings.me, {
        method: "GET",
    });
}