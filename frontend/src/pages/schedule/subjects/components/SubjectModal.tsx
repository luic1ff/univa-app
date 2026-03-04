import { useState, useEffect } from "react";
import { BookOpenIcon, UserIcon, PaletteIcon } from "lucide-react";
import { useCreateSubject, useUpdateSubject } from "@/entities/schedule/api/hooks";
import type { Subject } from "@/entities/schedule/model/types";
import { ModalShell } from "@/shared/ui/modal-shell";

interface Props {
    subject?: Subject;
    onClose: () => void;
}

const COLORS = [
    "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4",
    "#10b981", "#22c55e", "#a855f7", "#ec4899",
    "#ef4444", "#f97316", "#f59e0b", "#64748b",
];

const inputCls =
    "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground " +
    "placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/50 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50";

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

export function SubjectModal({ subject, onClose }: Props) {
    const isEdit = !!subject;

    const [form, setForm] = useState({
        name:        "",
        teacherName: "",
        color:       COLORS[0],
    });

    useEffect(() => {
        if (subject) {
            setForm({
                name:        subject.name,
                teacherName: subject.teacherName || "",
                color:       subject.color || COLORS[0],
            });
        }
    }, [subject]);

    const createSubject = useCreateSubject();
    const updateSubject = useUpdateSubject();
    const isPending     = createSubject.isPending || updateSubject.isPending;
    const isError       = createSubject.isError   || updateSubject.isError;

    function set(key: string, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim()) return;
        const payload = {
            name:        form.name.trim(),
            teacherName: form.teacherName.trim() || null,
            color:       form.color,
        };
        if (isEdit && subject) {
            await updateSubject.mutateAsync({ id: subject.id, payload });
        } else {
            await createSubject.mutateAsync(payload);
        }
        onClose();
    }

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title=""
            className="sm:max-w-[420px] p-0 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: `${form.color}20` }}
                >
                    <BookOpenIcon className="w-5 h-5" style={{ color: form.color }} />
                </div>
                <div>
                    <h2 className="text-base font-black text-foreground">
                        {isEdit ? "Редагувати предмет" : "Новий предмет"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isEdit ? "Змініть дані предмета" : "Додайте дисципліну до розкладу"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

                <Field label="Назва предмета" required>
                    <div className="relative">
                        <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            className={inputCls + " pl-9"}
                            placeholder="Наприклад: Вища математика"
                            value={form.name}
                            onChange={e => set("name", e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                </Field>

                <Field label="Викладач">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            className={inputCls + " pl-9"}
                            placeholder="ПІБ викладача (необов'язково)"
                            value={form.teacherName}
                            onChange={e => set("teacherName", e.target.value)}
                        />
                    </div>
                </Field>

                {/* Color picker */}
                <Field label="Колір маркеру">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 mb-3">
                            <PaletteIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                            <span className="text-xs text-muted-foreground">Обраний колір</span>
                            <div
                                className="w-4 h-4 rounded-full ml-auto shadow-sm ring-2 ring-offset-2 ring-offset-muted/20 transition-colors duration-300"
                                style={{ backgroundColor: form.color }}
                            />
                            <code className="text-[10px] font-mono text-muted-foreground">{form.color}</code>
                        </div>

                        {/* Preview bar */}
                        <div
                            className="h-1.5 w-full rounded-full mb-3 transition-colors duration-300"
                            style={{ background: `linear-gradient(90deg, ${form.color}, ${form.color}55)` }}
                        />

                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => set("color", c)}
                                    className="w-8 h-8 rounded-full transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                    style={{
                                        backgroundColor: c,
                                        transform:    form.color === c ? "scale(1.2)" : undefined,
                                        boxShadow:    form.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined,
                                    }}
                                    aria-label={`Колір ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                </Field>

                {isError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 rounded-xl font-medium">
                        Сталася помилка при збереженні.
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={!form.name.trim() || isPending}
                        className="h-9 px-5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        style={{ backgroundColor: form.color }}
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Збереження…
                            </span>
                        ) : isEdit ? "Зберегти зміни" : "Створити предмет"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}