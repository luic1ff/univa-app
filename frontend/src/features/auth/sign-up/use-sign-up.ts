import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { fetchCsrfToken } from "@/shared/api/csrf";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/entities/user/model/auth-store";
import type { User } from "@/entities/user/model/types";
import type { RegisterFormData } from "@/shared/shadcn/components/auth/register-form";

function toFormData(form: RegisterFormData): FormData {
    const fd = new FormData();

    // Персональні
    fd.append("first_name", form.first_name);
    fd.append("last_name", form.last_name);
    if (form.middle_name) fd.append("middle_name", form.middle_name);

    // Акаунт
    fd.append("username", form.username);
    fd.append("email", form.email);

    // Безпека
    fd.append("password", form.password);
    fd.append("password_confirmation", form.password_confirmation);

    // Boolean -> "1"/"0"
    fd.append("agree_terms", form.agree_terms ? "1" : "0");
    fd.append("marketing_opt_in", form.marketing_opt_in ? "1" : "0");

    return fd;
}

export function useSignUp() {
    return useMutation({
        mutationFn: async (form: RegisterFormData): Promise<User> => {
            await fetchCsrfToken();

            const fd = toFormData(form);

            return apiFetch<User>(ENDPOINTS.auth.register, {
                method: "POST",
                body: fd,
            });
        },
        onSuccess: (user) => {
            authStore.setUser(user);
        },
    });
}