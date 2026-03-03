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
    // ── Schedule module ───────────────────────────────────────────────────────
    schedule: (from: string, to: string) => `${API}/schedule?from=${from}&to=${to}`,
    subjects: {
        list: `${API}/subjects`,
        create: `${API}/subjects`,
        update: (id: number) => `${API}/subjects/${id}`,
        delete: (id: number) => `${API}/subjects/${id}`,
    },
    lessons: {
        create: `${API}/schedule-lessons`,
        update: (id: number) => `${API}/schedule-lessons/${id}`,
        delete: (id: number) => `${API}/schedule-lessons/${id}`,
        createException: (lessonId: number) => `${API}/schedule-lessons/${lessonId}/exceptions`,
        deleteException: (id: number) => `${API}/exceptions/${id}`,
    },
    exams: {
        list: (from: string, to: string) => `${API}/exams?from=${from}&to=${to}`,
        create: `${API}/exams`,
        update: (id: number) => `${API}/exams/${id}`,
        delete: (id: number) => `${API}/exams/${id}`,
    },
    dictionaries: {
        lessonTypes: `${API}/dictionaries/lesson-types`,
        deliveryModes: `${API}/dictionaries/delivery-modes`,
        examTypes: `${API}/dictionaries/exam-types`,
        recurrenceRules: `${API}/dictionaries/recurrence-rules`,
    },
} as const;

