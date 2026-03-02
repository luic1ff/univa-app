import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { User } from "../model/types";

export interface UpdateProfilePayload {
    firstName: string;
    lastName?: string;
    username: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    password: string;
    password_confirmation: string;
}

export const userQueries = {
    me: () => ({
        queryKey: ["me"],
        queryFn: () => apiFetch<User>(ENDPOINTS.auth.me),
    }),
    updateProfile: (payload: UpdateProfilePayload) => ({
        queryKey: ["me", "profile"],
        queryFn: () =>
            apiFetch<User>(ENDPOINTS.me.profile, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
    }),
    changePassword: (payload: ChangePasswordPayload) => ({
        queryKey: ["me", "password"],
        queryFn: () =>
            apiFetch<void>(ENDPOINTS.me.password, {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    }),
};
