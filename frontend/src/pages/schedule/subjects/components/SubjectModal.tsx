import { useState, useEffect } from "react";
import { useCreateSubject, useUpdateSubject } from "@/entities/schedule/api/hooks";
import type { Subject } from "@/entities/schedule/model/types";
import { ModalShell } from "@/shared/ui/modal-shell";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { DialogFooter } from "@/shared/shadcn/ui/dialog";

interface Props {
    subject?: Subject;
    onClose: () => void;
}

const COLORS = [
    "#6366f1", // primary
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#64748b", // slate
];

export function SubjectModal({ subject, onClose }: Props) {
    const isEdit = !!subject;
    const [form, setForm] = useState({
        name: "",
        teacher_name: "",
        color: COLORS[0],
    });

    useEffect(() => {
        if (subject) {
            setForm({
                name: subject.name,
                teacher_name: subject.teacher_name || "",
                color: subject.color || COLORS[0],
            });
        }
    }, [subject]);

    const createSubject = useCreateSubject();
    const updateSubject = useUpdateSubject();

    function set(key: string, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) return;

        const payload = {
            name: form.name.trim(),
            teacher_name: form.teacher_name.trim() || null,
            color: form.color,
        };

        if (isEdit && subject) {
            await updateSubject.mutateAsync({ id: subject.id, payload });
        } else {
            await createSubject.mutateAsync(payload);
        }
        onClose();
    }

    const isPending = createSubject.isPending || updateSubject.isPending;
    const isError = createSubject.isError || updateSubject.isError;

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title={isEdit ? "Редагувати предмет" : "Додати предмет"}
            description="Вкажіть назву предмета, викладача та колір для відображення в розкладі."
            className="sm:max-w-[425px]"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Назва <span className="text-destructive">*</span></Label>
                    <Input
                        id="name"
                        placeholder="Наприклад: Вища математика"
                        value={form.name}
                        onChange={e => set("name", e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher_name">Викладач</Label>
                    <Input
                        id="teacher_name"
                        placeholder="ПІБ викладача (необов'язково)"
                        value={form.teacher_name}
                        onChange={e => set("teacher_name", e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Колір маркеру</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => set("color", c)}
                                className="w-8 h-8 rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                style={{
                                    backgroundColor: c,
                                    border: form.color === c ? "2px solid var(--foreground)" : "2px solid transparent",
                                    transform: form.color === c ? "scale(1.15)" : "scale(1)"
                                }}
                                aria-label={`Вибрати колір ${c}`}
                            />
                        ))}
                    </div>
                </div>

                {isError && (
                    <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md mt-2">
                        Сталася помилка при збереженні.
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Збереження…" : "Зберегти"}
                    </Button>
                </DialogFooter>
            </form>
        </ModalShell>
    );
}
