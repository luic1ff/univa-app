import { useState } from "react";
import { format } from "date-fns";
import {
    BookOpenIcon, CalendarIcon, ClockIcon,
    FlaskConicalIcon, MapPinIcon, PlusIcon,
    RefreshCwIcon, StickyNoteIcon,
} from "lucide-react";
import {
    useSubjects, useCreateLesson, useLessonTypes,
    useDeliveryModes, useRecurrenceRules,
} from "@/entities/schedule/api/hooks";
import { ModalShell } from "@/shared/ui/modal-shell";

interface Props {
    onClose: () => void;
}

const WEEKDAYS = [
    { value: 1, label: "Понеділок" },
    { value: 2, label: "Вівторок" },
    { value: 3, label: "Середа" },
    { value: 4, label: "Четвер" },
    { value: 5, label: "П'ятниця" },
    { value: 6, label: "Субота" },
    { value: 7, label: "Неділя" },
];

/* ── Field wrapper ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

const selectCls =
    "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground " +
    "transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed appearance-none";

const inputCls =
    "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground " +
    "placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/50 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50";

export function AddLessonModal({ onClose }: Props) {
    const today = format(new Date(), "yyyy-MM-dd");

    const [form, setForm] = useState({
        subject_id:        0,
        weekday:           1,
        starts_at:         "08:30",
        ends_at:           "10:05",
        lesson_type_id:    0,
        delivery_mode_id:  0,
        location_text:     "",
        note:              "",
        recurrence_rule_id: 0,
        active_from:       today,
        active_to:         "",
    });

    const { data: subjects        = [] } = useSubjects();
    const { data: lessonTypes     = [] } = useLessonTypes();
    const { data: deliveryModes   = [] } = useDeliveryModes();
    const { data: recurrenceRules = [] } = useRecurrenceRules();
    const createLesson = useCreateLesson();

    function set(key: string, value: unknown) {
        setForm(f => ({ ...f, [key]: value }));
    }

    const isValid =
        form.subject_id > 0 &&
        form.lesson_type_id > 0 &&
        form.delivery_mode_id > 0 &&
        form.recurrence_rule_id > 0 &&
        !!form.starts_at &&
        !!form.ends_at;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;
        await createLesson.mutateAsync({
            subject_id:         form.subject_id,
            weekday:            form.weekday,
            starts_at:          form.starts_at,
            ends_at:            form.ends_at,
            lesson_type_id:     form.lesson_type_id,
            delivery_mode_id:   form.delivery_mode_id,
            location_text:      form.location_text || null,
            note:               form.note || null,
            recurrence_rule_id: form.recurrence_rule_id,
            active_from:        form.active_from,
            active_to:          form.active_to || null,
        });
        onClose();
    }

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title=""
            className="sm:max-w-[520px] p-0 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <PlusIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-base font-black text-foreground">Додати пару</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Регулярне заняття в розкладі</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto max-h-[80vh]">

                {/* Subject */}
                <Field label="Предмет" required>
                    <div className="relative">
                        <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <select
                            className={selectCls + " pl-9"}
                            value={form.subject_id}
                            onChange={e => set("subject_id", +e.target.value)}
                            required
                        >
                            <option value={0} disabled>Оберіть предмет</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </Field>

                {/* Weekday + Time */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <Field label="День тижня" required>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                                <select
                                    className={selectCls + " pl-9"}
                                    value={form.weekday}
                                    onChange={e => set("weekday", +e.target.value)}
                                >
                                    {WEEKDAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </select>
                            </div>
                        </Field>
                    </div>
                    <Field label="Початок" required>
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="time"
                                className={inputCls + " pl-9"}
                                value={form.starts_at}
                                onChange={e => set("starts_at", e.target.value)}
                                required
                            />
                        </div>
                    </Field>
                    <Field label="Кінець" required>
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="time"
                                className={inputCls + " pl-9"}
                                value={form.ends_at}
                                onChange={e => set("ends_at", e.target.value)}
                                required
                            />
                        </div>
                    </Field>
                </div>

                {/* Lesson type + Delivery mode */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Тип пари" required>
                        <div className="relative">
                            <FlaskConicalIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <select
                                className={selectCls + " pl-9"}
                                value={form.lesson_type_id}
                                onChange={e => set("lesson_type_id", +e.target.value)}
                                required
                            >
                                <option value={0} disabled>Тип</option>
                                {lessonTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </Field>
                    <Field label="Формат" required>
                        <select
                            className={selectCls}
                            value={form.delivery_mode_id}
                            onChange={e => set("delivery_mode_id", +e.target.value)}
                            required
                        >
                            <option value={0} disabled>Формат</option>
                            {deliveryModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </Field>
                </div>

                {/* Recurrence */}
                <Field label="Повторення" required>
                    <div className="relative">
                        <RefreshCwIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <select
                            className={selectCls + " pl-9"}
                            value={form.recurrence_rule_id}
                            onChange={e => set("recurrence_rule_id", +e.target.value)}
                            required
                        >
                            <option value={0} disabled>Оберіть правило</option>
                            {recurrenceRules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </Field>

                {/* Location */}
                <Field label="Аудиторія / Посилання">
                    <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            className={inputCls + " pl-9"}
                            placeholder="А-201 або https://meet..."
                            value={form.location_text}
                            onChange={e => set("location_text", e.target.value)}
                        />
                    </div>
                </Field>

                {/* Active period */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Активний період</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="З" required>
                            <input
                                type="date"
                                className={inputCls}
                                value={form.active_from}
                                onChange={e => set("active_from", e.target.value)}
                                required
                            />
                        </Field>
                        <Field label="До (включно)">
                            <input
                                type="date"
                                className={inputCls}
                                value={form.active_to}
                                onChange={e => set("active_to", e.target.value)}
                            />
                        </Field>
                    </div>
                </div>

                {/* Note */}
                <Field label="Нотатка">
                    <div className="relative">
                        <StickyNoteIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            className={inputCls + " pl-9"}
                            placeholder="Необов'язково"
                            value={form.note}
                            onChange={e => set("note", e.target.value)}
                        />
                    </div>
                </Field>

                {createLesson.isError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 rounded-xl font-medium">
                        Помилка. Перевірте дані або чи немає конфлікту часу.
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 pt-1 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-6 px-6 py-3 border-t border-border mt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || createLesson.isPending}
                        className="h-9 px-5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {createLesson.isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                                Збереження…
                            </span>
                        ) : "Зберегти пару"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}