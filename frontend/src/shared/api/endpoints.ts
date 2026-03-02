const API = "/api/v1";

export const ENDPOINTS = {
    auth: {
        csrf: "/sanctum/csrf-cookie",
        register: `${API}/register`,
        login: `${API}/login`,
        logout: `${API}/logout`,
        me: `${API}/me/univa-user`,
    },
    me: {
        profile: `${API}/me/profile`,
        password: `${API}/me/password`,
        avatar: `${API}/me/avatar`,
    },
    settings: {
        me: `${API}/me/settings`,
        group: (groupId: number) => `${API}/settings?group_id=${groupId}`,
        update: (key: string) => `${API}/settings/${encodeURIComponent(key)}`,
        bulk: `${API}/settings`,
    },
} as const;
