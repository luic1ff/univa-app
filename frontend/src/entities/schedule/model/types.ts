// ─── Dictionary types ─────────────────────────────────────────────────────────

export interface LessonType {
    id: number;
    code: string;
    name: string;
    color: string | null;
}

export interface DeliveryMode {
    id: number;
    code: string;
    name: string;
}

export interface ExamType {
    id: number;
    code: string;
    name: string;
}

export interface RecurrenceRule {
    id: number;
    code: "weekly" | "biweekly_even" | "biweekly_odd" | string;
    name: string;
    meta: Record<string, unknown> | null;
}

// ─── Subject ─────────────────────────────────────────────────────────────────

export interface Subject {
    id: number;
    name: string;
    teacherName: string | null;
    color: string | null;
}

// ─── Schedule lesson (rule) ───────────────────────────────────────────────────

export interface ScheduleLesson {
    id: number;
    subject_id: number;
    weekday: number; // 1 Mon … 7 Sun
    starts_at: string; // "HH:mm"
    ends_at: string;
    lesson_type_id: number;
    delivery_mode_id: number;
    location_text: string | null;
    note: string | null;
    recurrence_rule_id: number;
    active_from: string; // "YYYY-MM-DD"
    active_to: string | null;
    subject?: Subject;
    lesson_type?: LessonType;
    delivery_mode?: DeliveryMode;
    recurrence_rule?: RecurrenceRule;
}

// ─── Built lesson instance (returned by GET /schedule) ───────────────────────

export type LessonSource = "rule" | "exception" | "exam";

export interface LessonInstance {
    id: number;
    lessonId: number | null;
    date: string; // "YYYY-MM-DD"
    startsAt: string; // "HH:mm" or "HH:mm:ss"
    endsAt: string | null;
    subject: {
        id: number;
        name: string;
        teacherName: string | null;
        color: string | null;
    };
    lessonType: {
        id: number;
        code: string;
        name: string;
        color: string | null;
    } | null;
    examType?: {
        id: number;
        code: string;
        name: string;
    };
    deliveryMode: {
        id: number;
        code: string;
        name: string;
    } | null;
    location: string | null;
    note: string | null;
    source: LessonSource;
}

// ─── Exception ────────────────────────────────────────────────────────────────

export type ExceptionAction = "cancelled" | "rescheduled" | "modified";

export interface ScheduleException {
    id: number;
    schedule_lesson_id: number;
    date: string;
    action: ExceptionAction;
    override_starts_at: string | null;
    override_ends_at: string | null;
    override_location_text: string | null;
    override_teacher: string | null;
    override_subject_id: number | null;
    reason: string | null;
}

// ─── Exam Event ───────────────────────────────────────────────────────────────

export interface ExamEvent {
    id: number;
    subject_id: number;
    exam_type_id: number;
    starts_at: string; // "YYYY-MM-DD HH:mm"
    ends_at: string | null;
    location_text: string | null;
    note: string | null;
    subject?: Subject;
    exam_type?: ExamType;
}

// ─── Form payloads ────────────────────────────────────────────────────────────

export interface CreateSubjectPayload {
    name: string;
    teacher_name?: string | null;
    color?: string | null;
}

export interface CreateLessonPayload {
    subject_id: number;
    weekday: number;
    starts_at: string;
    ends_at: string;
    lesson_type_id: number;
    delivery_mode_id: number;
    location_text?: string | null;
    note?: string | null;
    recurrence_rule_id: number;
    active_from: string;
    active_to?: string | null;
}

export interface CreateExceptionPayload {
    date: string;
    action: ExceptionAction;
    override_starts_at?: string | null;
    override_ends_at?: string | null;
    override_location_text?: string | null;
    override_teacher?: string | null;
    override_subject_id?: number | null;
    reason?: string | null;
}

export interface CreateExamPayload {
    subject_id: number;
    exam_type_id: number;
    starts_at: string;
    ends_at?: string | null;
    location_text?: string | null;
    note?: string | null;
}
