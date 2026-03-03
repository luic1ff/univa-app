import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    scheduleQueries,
    subjectQueries,
    lessonQueries,
    examQueries,
    dictionaryQueries,
} from "./queries";
import type {
    CreateSubjectPayload,
    CreateLessonPayload,
    CreateExceptionPayload,
    CreateExamPayload,
} from "../model/types";

// ─── Schedule ─────────────────────────────────────────────────────────────────

export function useSchedule(from: string, to: string) {
    return useQuery(scheduleQueries.built(from, to));
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export function useSubjects() {
    return useQuery(subjectQueries.list());
}

export function useCreateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSubjectPayload) =>
            subjectQueries.create(payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    });
}

export function useUpdateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateSubjectPayload> }) =>
            subjectQueries.update(id, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    });
}

export function useDeleteSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => subjectQueries.delete(id).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    });
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export function useCreateLesson() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateLessonPayload) =>
            lessonQueries.create(payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

export function useUpdateLesson() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateLessonPayload> }) =>
            lessonQueries.update(id, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

export function useDeleteLesson() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => lessonQueries.delete(id).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

export function useCreateException() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ lessonId, payload }: { lessonId: number; payload: CreateExceptionPayload }) =>
            lessonQueries.createException(lessonId, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

export function useDeleteException() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => lessonQueries.deleteException(id).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

// ─── Exams ────────────────────────────────────────────────────────────────────

export function useCreateExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateExamPayload) =>
            examQueries.create(payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

export function useUpdateExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateExamPayload> }) =>
            examQueries.update(id, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

export function useDeleteExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => examQueries.delete(id).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
    });
}

// ─── Dictionaries ─────────────────────────────────────────────────────────────

export function useLessonTypes() {
    return useQuery(dictionaryQueries.lessonTypes());
}

export function useDeliveryModes() {
    return useQuery(dictionaryQueries.deliveryModes());
}

export function useExamTypes() {
    return useQuery(dictionaryQueries.examTypes());
}

export function useRecurrenceRules() {
    return useQuery(dictionaryQueries.recurrenceRules());
}
