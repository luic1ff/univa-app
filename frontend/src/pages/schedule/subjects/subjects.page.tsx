import React, { useState, useMemo } from "react";
import {
    BookOpenIcon, Edit2Icon, PlusIcon,
    SearchIcon, Trash2Icon, UserIcon,
} from "lucide-react";
import { useSubjects, useDeleteSubject } from "@/entities/schedule/api/hooks";
import type { Subject } from "@/entities/schedule/model/types";
import { SubjectModal } from "./components/SubjectModal";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export function SubjectsPage() {
    const { data: subjects = [], isLoading } = useSubjects();
    const deleteSubject = useDeleteSubject();

    const [modalSubject, setModalSubject] = useState<Subject | null | "new">(null);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search.trim()) return subjects;
        const q = search.trim().toLowerCase();
        return subjects.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.teacherName && s.teacherName.toLowerCase().includes(q))
        );
    }, [subjects, search]);

    async function handleDelete(e: React.MouseEvent, id: number) {
        e.stopPropagation();
        if (confirm("Видалити цей предмет? Усі пов'язані заняття також можуть бути видалені.")) {
            await deleteSubject.mutateAsync(id);
        }
    }

    return (
        <div className="flex flex-col gap-5 h-full">

            {/* ── Header ─────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-black tracking-tight text-foreground">Предмети</h1>
                        {!isLoading && subjects.length > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground tabular-nums">
                                {subjects.length}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Керуйте навчальними дисциплінами
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Пошук..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-9 w-48 rounded-xl border border-border bg-muted/30 pl-9 pr-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setModalSubject("new")}
                        className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Додати
                    </button>
                </div>
            </div>

            {/* ── Content ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto pb-6">

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-border overflow-hidden">
                                <Skeleton className="h-1.5 w-full rounded-none" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                                    <Skeleton className="h-3 w-1/2 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>

                ) : subjects.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                            <BookOpenIcon className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="font-bold text-foreground">Немає предметів</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                            Додайте перший предмет, щоб почати складати розклад
                        </p>
                        <button
                            onClick={() => setModalSubject("new")}
                            className="mt-5 h-9 px-4 flex items-center gap-1.5 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Створити предмет
                        </button>
                    </div>

                ) : filtered.length === 0 ? (
                    /* ── No search results ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                            <SearchIcon className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="font-bold text-foreground">Нічого не знайдено</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            За запитом «{search}» предметів не знайдено
                        </p>
                        <button
                            onClick={() => setSearch("")}
                            className="mt-4 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                        >
                            Очистити пошук
                        </button>
                    </div>

                ) : (
                    /* ── Subject grid ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.map(subject => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                onEdit={() => setModalSubject(subject)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {modalSubject && (
                <SubjectModal
                    subject={modalSubject === "new" ? undefined : modalSubject}
                    onClose={() => setModalSubject(null)}
                />
            )}
        </div>
    );
}

/* ── SubjectCard ────────────────────────────────────────────── */

interface CardProps {
    subject: Subject;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
}

function SubjectCard({ subject, onEdit, onDelete }: CardProps) {
    const accent = subject.color || "#6366f1";

    return (
        <div
            className="group relative rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-px active:translate-y-0"
            onClick={onEdit}
        >
            {/* Top accent line */}
            <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}60 100%)` }}
            />

            {/* Card body */}
            <div
                className="p-4"
                style={{ background: `linear-gradient(135deg, ${accent}08 0%, transparent 55%)` }}
            >
                {/* Name row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-background transition-colors"
                            style={{ backgroundColor: accent, ringColor: `${accent}40` }}
                        />
                        <h3
                            className="font-bold text-sm text-foreground truncate leading-tight"
                            title={subject.name}
                        >
                            {subject.name}
                        </h3>
                    </div>

                    {/* Action buttons — fade in on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-1">
                        <button
                            onClick={e => { e.stopPropagation(); onEdit(); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Редагувати"
                        >
                            <Edit2Icon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={e => onDelete(e, subject.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Видалити"
                        >
                            <Trash2Icon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Teacher */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <UserIcon className="w-3 h-3 shrink-0 opacity-60" />
                    <span className="truncate">
                        {subject.teacherName || "Викладач не вказаний"}
                    </span>
                </div>
            </div>
        </div>
    );
}