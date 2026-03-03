import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    LessonInstance,
    Subject,
    ExamEvent,
    LessonType,
    DeliveryMode,
    ExamType,
    RecurrenceRule,
    CreateSubjectPayload,
    CreateLessonPayload,
    CreateExceptionPayload,
    CreateExamPayload,
    ScheduleException,
} from "../model/types";

// ─── Schedule (built) ─────────────────────────────────────────────────────────

export const scheduleQueries = {
    built: (from: string, to: string) => ({
        queryKey: ["schedule", from, to],
        queryFn: () => apiFetch<LessonInstance[]>(ENDPOINTS.schedule(from, to)),
        staleTime: 1000 * 60 * 2, // 2 min
    }),
};

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const subjectQueries = {
    list: () => ({
        queryKey: ["subjects"],
        queryFn: () => apiFetch<Subject[]>(ENDPOINTS.subjects.list),
        staleTime: 1000 * 60 * 10,
    }),
    create: (payload: CreateSubjectPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<Subject>(ENDPOINTS.subjects.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (id: number, payload: Partial<CreateSubjectPayload>) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<Subject>(ENDPOINTS.subjects.update(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    delete: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.subjects.delete(id), { method: "DELETE" }),
    }),
};

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const lessonQueries = {
    create: (payload: CreateLessonPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<unknown>(ENDPOINTS.lessons.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (id: number, payload: Partial<CreateLessonPayload>) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<unknown>(ENDPOINTS.lessons.update(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    delete: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.lessons.delete(id), { method: "DELETE" }),
    }),
    createException: (lessonId: number, payload: CreateExceptionPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<ScheduleException>(
            ENDPOINTS.lessons.createException(lessonId),
            { method: "POST", body: JSON.stringify(payload) }
        ),
    }),
    deleteException: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.lessons.deleteException(id), { method: "DELETE" }),
    }),
};

// ─── Exams ────────────────────────────────────────────────────────────────────

export const examQueries = {
    list: (from: string, to: string) => ({
        queryKey: ["exams", from, to],
        queryFn: () => apiFetch<ExamEvent[]>(ENDPOINTS.exams.list(from, to)),
    }),
    create: (payload: CreateExamPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<ExamEvent>(ENDPOINTS.exams.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (id: number, payload: Partial<CreateExamPayload>) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<ExamEvent>(ENDPOINTS.exams.update(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    delete: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.exams.delete(id), { method: "DELETE" }),
    }),
};

// ─── Dictionaries ─────────────────────────────────────────────────────────────

export const dictionaryQueries = {
    lessonTypes: () => ({
        queryKey: ["dict", "lesson-types"],
        queryFn: () => apiFetch<LessonType[]>(ENDPOINTS.dictionaries.lessonTypes),
        staleTime: Infinity,
    }),
    deliveryModes: () => ({
        queryKey: ["dict", "delivery-modes"],
        queryFn: () => apiFetch<DeliveryMode[]>(ENDPOINTS.dictionaries.deliveryModes),
        staleTime: Infinity,
    }),
    examTypes: () => ({
        queryKey: ["dict", "exam-types"],
        queryFn: () => apiFetch<ExamType[]>(ENDPOINTS.dictionaries.examTypes),
        staleTime: Infinity,
    }),
    recurrenceRules: () => ({
        queryKey: ["dict", "recurrence-rules"],
        queryFn: () => apiFetch<RecurrenceRule[]>(ENDPOINTS.dictionaries.recurrenceRules),
        staleTime: Infinity,
    }),
};
