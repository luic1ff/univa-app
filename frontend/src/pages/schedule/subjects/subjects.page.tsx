import { useState, useMemo } from "react";
import { PlusIcon, Edit2Icon, Trash2Icon, BookOpenIcon, SearchIcon } from "lucide-react";
import { useSubjects, useDeleteSubject } from "@/entities/schedule/api/hooks";
import type { Subject } from "@/entities/schedule/model/types";
import { SubjectModal } from "./components/SubjectModal";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Input } from "@/shared/shadcn/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";

export function SubjectsPage() {
    const { data: subjects = [], isLoading } = useSubjects();
    const deleteSubject = useDeleteSubject();

    const [modalSubject, setModalSubject] = useState<Subject | null | "new">(null);
    const [search, setSearch] = useState("");

    // Filter subjects by search
    const filtered = useMemo(() => {
        if (!search.trim()) return subjects;
        const q = search.trim().toLowerCase();
        return subjects.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.teacher_name && s.teacher_name.toLowerCase().includes(q))
        );
    }, [subjects, search]);

    async function handleDelete(e: React.MouseEvent, id: number) {
        e.stopPropagation();
        if (confirm("Ви дійсно хочете видалити цей предмет? Усі заняття з цим предметом також можуть бути видалені.")) {
            await deleteSubject.mutateAsync(id);
        }
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Предмети</h1>
                            {!isLoading && (
                                <Badge variant="secondary" className="text-xs">
                                    {subjects.length}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Керуйте своїми навчальними дисциплінами
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-[220px]">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Пошук предметів..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 h-8"
                        />
                    </div>
                    <Button onClick={() => setModalSubject("new")} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Додати
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <Skeleton className="h-2 w-full rounded-none" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filtered.length === 0 && search ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <SearchIcon className="w-10 h-10 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-1">Нічого не знайдено</h3>
                        <p className="text-sm text-muted-foreground">
                            За запитом "{search}" предметів не знайдено.
                        </p>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-card mt-8">
                        <BookOpenIcon className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Немає предметів</h3>
                        <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
                            У вас ще немає доданих навчальних предметів. Створіть перший, щоб додати його до розкладу.
                        </p>
                        <Button onClick={() => setModalSubject("new")} variant="outline">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Створити предмет
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(subject => (
                            <Card
                                key={subject.id}
                                className="overflow-hidden group hover:shadow-lg transition-all duration-200 cursor-pointer"
                                onClick={() => setModalSubject(subject)}
                            >
                                <CardContent className="p-0">
                                    {/* Top gradient bar using subject color */}
                                    <div
                                        className="h-2 w-full"
                                        style={{
                                            background: `linear-gradient(90deg, ${subject.color || "#6366f1"}, ${subject.color || "#6366f1"}88)`,
                                        }}
                                    />

                                    <div
                                        className="p-4 relative"
                                        style={{
                                            background: `linear-gradient(135deg, ${subject.color || "#6366f1"}08 0%, transparent 60%)`,
                                        }}
                                    >
                                        {/* Color dot + Name */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-card"
                                                    style={{
                                                        backgroundColor: subject.color || "#6366f1",
                                                    }}
                                                />
                                                <h3
                                                    className="font-semibold text-foreground truncate"
                                                    title={subject.name}
                                                >
                                                    {subject.name}
                                                </h3>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={(e) => { e.stopPropagation(); setModalSubject(subject); }}
                                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Edit2Icon className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Редагувати</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                onClick={(e) => handleDelete(e, subject.id)}
                                                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2Icon className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Видалити</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        {/* Teacher */}
                                        <p className="text-sm text-muted-foreground truncate" title={subject.teacher_name || ""}>
                                            {subject.teacher_name || "Викладач не вказаний"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalSubject && (
                <SubjectModal
                    subject={modalSubject === "new" ? undefined : modalSubject}
                    onClose={() => setModalSubject(null)}
                />
            )}
        </div>
    );
}
