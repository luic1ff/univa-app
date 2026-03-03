import { useState } from "react";
import { format } from "date-fns";
import { useSubjects, useCreateLesson, useLessonTypes, useDeliveryModes, useRecurrenceRules } from "@/entities/schedule/api/hooks";
import { ModalShell } from "@/shared/ui/modal-shell";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { DialogFooter } from "@/shared/shadcn/ui/dialog";

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

export function AddLessonModal({ onClose }: Props) {
    const today = format(new Date(), "yyyy-MM-dd");

    const [form, setForm] = useState({
        subject_id: 0,
        weekday: 1,
        starts_at: "08:30",
        ends_at: "10:05",
        lesson_type_id: 0,
        delivery_mode_id: 0,
        location_text: "",
        note: "",
        recurrence_rule_id: 0,
        active_from: today,
        active_to: "",
    });

    const { data: subjects = [] } = useSubjects();
    const { data: lessonTypes = [] } = useLessonTypes();
    const { data: deliveryModes = [] } = useDeliveryModes();
    const { data: recurrenceRules = [] } = useRecurrenceRules();

    const createLesson = useCreateLesson();

    function set(key: string, value: unknown) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.subject_id || !form.lesson_type_id || !form.delivery_mode_id || !form.recurrence_rule_id) return;

        await createLesson.mutateAsync({
            subject_id: form.subject_id,
            weekday: form.weekday,
            starts_at: form.starts_at,
            ends_at: form.ends_at,
            lesson_type_id: form.lesson_type_id,
            delivery_mode_id: form.delivery_mode_id,
            location_text: form.location_text || null,
            note: form.note || null,
            recurrence_rule_id: form.recurrence_rule_id,
            active_from: form.active_from,
            active_to: form.active_to || null,
        });
        onClose();
    }

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title="Додати пару"
            className="sm:max-w-[500px]"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                {/* Subject */}
                <div className="flex flex-col gap-2">
                    <Label>Предмет <span className="text-destructive">*</span></Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.subject_id}
                        onChange={e => set("subject_id", +e.target.value)}
                        required
                    >
                        <option value={0} disabled>Оберіть предмет</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {/* Weekday */}
                <div className="flex flex-col gap-2">
                    <Label>День тижня <span className="text-destructive">*</span></Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.weekday}
                        onChange={e => set("weekday", +e.target.value)}
                    >
                        {WEEKDAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Початок <span className="text-destructive">*</span></Label>
                        <Input type="time" value={form.starts_at} onChange={e => set("starts_at", e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Кінець <span className="text-destructive">*</span></Label>
                        <Input type="time" value={form.ends_at} onChange={e => set("ends_at", e.target.value)} required />
                    </div>
                </div>

                {/* Lesson type & delivery mode */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Тип пари <span className="text-destructive">*</span></Label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.lesson_type_id}
                            onChange={e => set("lesson_type_id", +e.target.value)}
                            required
                        >
                            <option value={0} disabled>Тип</option>
                            {lessonTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Формат <span className="text-destructive">*</span></Label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.delivery_mode_id}
                            onChange={e => set("delivery_mode_id", +e.target.value)}
                            required
                        >
                            <option value={0} disabled>Формат</option>
                            {deliveryModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Recurrence */}
                <div className="flex flex-col gap-2">
                    <Label>Повторення <span className="text-destructive">*</span></Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.recurrence_rule_id}
                        onChange={e => set("recurrence_rule_id", +e.target.value)}
                        required
                    >
                        <option value={0} disabled>Оберіть</option>
                        {recurrenceRules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2">
                    <Label>Аудиторія / Посилання</Label>
                    <Input type="text" placeholder="А-201 або https://meet..." value={form.location_text} onChange={e => set("location_text", e.target.value)} />
                </div>

                {/* Active period */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Активно з <span className="text-destructive">*</span></Label>
                        <Input type="date" value={form.active_from} onChange={e => set("active_from", e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>До (включно)</Label>
                        <Input type="date" value={form.active_to} onChange={e => set("active_to", e.target.value)} />
                    </div>
                </div>

                {/* Note */}
                <div className="flex flex-col gap-2">
                    <Label>Нотатка</Label>
                    <Input type="text" placeholder="Необов'язково" value={form.note} onChange={e => set("note", e.target.value)} />
                </div>

                {createLesson.isError && (
                    <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md mt-2">
                        Помилка. Перевірте дані або чи немає конфлікту часу.
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button type="submit" disabled={createLesson.isPending}>
                        {createLesson.isPending ? "Збереження…" : "Зберегти"}
                    </Button>
                </DialogFooter>
            </form>
        </ModalShell>
    );
}
