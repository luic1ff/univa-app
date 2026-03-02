import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries, type UpdateProfilePayload, type ChangePasswordPayload } from "./queries";
import { authStore } from "../model/auth-store";
import type { User } from "../model/types";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";

export function useMe() {
    return useQuery(userQueries.me());
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) =>
            userQueries.updateProfile(payload).queryFn(),
        onSuccess: (updatedUser) => {
            // Update both the query cache and the reactive auth store
            queryClient.setQueryData(["me"], updatedUser);
            authStore.setUser(updatedUser);
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            userQueries.changePassword(payload).queryFn(),
    });
}

export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append("avatar", file);
            return apiFetch<User>(ENDPOINTS.me.avatar, {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["me"], updatedUser);
            authStore.setUser(updatedUser);
        },
    });
}

