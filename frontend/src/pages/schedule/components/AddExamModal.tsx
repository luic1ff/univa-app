import { useState } from "react";
import { GraduationCapIcon, MapPinIcon, StickyNoteIcon, ClockIcon, BookOpenIcon } from "lucide-react";
import { useSubjects, useCreateExam, useExamTypes } from "@/entities/schedule/api/hooks";
import { ModalShell } from "@/shared/ui/modal-shell";

interface Props {
    onClose: () => void;
}

/* ── Shared field wrapper ── */
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

export function AddExamModal({ onClose }: Props) {
    const [form, setForm] = useState({
        subject_id: 0,
        exam_type_id: 0,
        starts_at: "",
        ends_at: "",
        location_text: "",
        note: "",
    });

    const { data: subjects  = [] } = useSubjects();
    const { data: examTypes = [] } = useExamTypes();
    const createExam = useCreateExam();

    function set(key: string, value: unknown) {
        setForm(f => ({ ...f, [key]: value }));
    }

    function toApiDateTime(v: string) {
        return v ? v.replace("T", " ") : "";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.subject_id || !form.exam_type_id || !form.starts_at) return;
        await createExam.mutateAsync({
            subject_id:    form.subject_id,
            exam_type_id:  form.exam_type_id,
            starts_at:     toApiDateTime(form.starts_at),
            ends_at:       form.ends_at ? toApiDateTime(form.ends_at) : null,
            location_text: form.location_text || null,
            note:          form.note || null,
        });
        onClose();
    }

    const isValid = form.subject_id > 0 && form.exam_type_id > 0 && !!form.starts_at;

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title=""
            className="sm:max-w-[440px] p-0 overflow-hidden"
        >
            {/* Modal header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <GraduationCapIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h2 className="text-base font-black text-foreground">Додати іспит / залік</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Одноразова подія в розкладі</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

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

                <Field label="Тип" required>
                    <select
                        className={selectCls}
                        value={form.exam_type_id}
                        onChange={e => set("exam_type_id", +e.target.value)}
                        required
                    >
                        <option value={0} disabled>Оберіть тип</option>
                        {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Початок" required>
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="datetime-local"
                                className={inputCls + " pl-9"}
                                value={form.starts_at}
                                onChange={e => set("starts_at", e.target.value)}
                                required
                            />
                        </div>
                    </Field>
                    <Field label="Кінець">
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="datetime-local"
                                className={inputCls + " pl-9"}
                                value={form.ends_at}
                                onChange={e => set("ends_at", e.target.value)}
                            />
                        </div>
                    </Field>
                </div>

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

                {createExam.isError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 rounded-xl font-medium">
                        Помилка при збереженні. Спробуйте ще раз.
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
                        disabled={!isValid || createExam.isPending}
                        className="h-9 px-5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {createExam.isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Збереження…
                            </span>
                        ) : "Зберегти іспит"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}