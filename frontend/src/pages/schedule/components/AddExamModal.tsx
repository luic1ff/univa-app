import { useState } from "react";
import { useSubjects, useCreateExam, useExamTypes } from "@/entities/schedule/api/hooks";
import { ModalShell } from "@/shared/ui/modal-shell";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { DialogFooter } from "@/shared/shadcn/ui/dialog";

interface Props {
    onClose: () => void;
}

export function AddExamModal({ onClose }: Props) {
    const [form, setForm] = useState({
        subject_id: 0,
        exam_type_id: 0,
        starts_at: "",
        ends_at: "",
        location_text: "",
        note: "",
    });

    const { data: subjects = [] } = useSubjects();
    const { data: examTypes = [] } = useExamTypes();
    const createExam = useCreateExam();

    function set(key: string, value: unknown) {
        setForm(f => ({ ...f, [key]: value }));
    }

    // Convert datetime-local format "YYYY-MM-DDTHH:mm" → "YYYY-MM-DD HH:mm"
    function toApiDateTime(v: string) {
        return v ? v.replace("T", " ") : "";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.subject_id || !form.exam_type_id || !form.starts_at) return;

        await createExam.mutateAsync({
            subject_id: form.subject_id,
            exam_type_id: form.exam_type_id,
            starts_at: toApiDateTime(form.starts_at),
            ends_at: form.ends_at ? toApiDateTime(form.ends_at) : null,
            location_text: form.location_text || null,
            note: form.note || null,
        });
        onClose();
    }

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title="Додати іспит / залік"
            className="sm:max-w-[425px]"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
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

                <div className="flex flex-col gap-2">
                    <Label>Тип <span className="text-destructive">*</span></Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.exam_type_id}
                        onChange={e => set("exam_type_id", +e.target.value)}
                        required
                    >
                        <option value={0} disabled>Оберіть тип</option>
                        {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Початок <span className="text-destructive">*</span></Label>
                        <Input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at", e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Кінець</Label>
                        <Input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at", e.target.value)} />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Аудиторія / Посилання</Label>
                    <Input type="text" placeholder="А-201 або https://meet..." value={form.location_text} onChange={e => set("location_text", e.target.value)} />
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Нотатка</Label>
                    <Input type="text" placeholder="Необов'язково" value={form.note} onChange={e => set("note", e.target.value)} />
                </div>

                {createExam.isError && (
                    <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md mt-2">
                        Помилка при збереженні. Спробуйте ще раз.
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button type="submit" disabled={createExam.isPending}>
                        {createExam.isPending ? "Збереження…" : "Зберегти"}
                    </Button>
                </DialogFooter>
            </form>
        </ModalShell>
    );
}
