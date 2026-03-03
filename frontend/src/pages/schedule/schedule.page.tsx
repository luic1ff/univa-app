import { useState, useMemo, useEffect } from "react";
import { addDays, format, startOfWeek, endOfWeek } from "date-fns";
import { uk } from "date-fns/locale";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    CalendarDaysIcon,
    BookOpenIcon,
    ClockIcon,
    AlertCircleIcon,
    TimerIcon,
} from "lucide-react";
import { useSchedule } from "@/entities/schedule/api/hooks";
import { LessonCard } from "./components/LessonCard";
import { MiniCalendar } from "./components/MiniCalendar";
import { AddLessonModal } from "./components/AddLessonModal";
import { AddExamModal } from "./components/AddExamModal";
import type { LessonInstance } from "@/entities/schedule/model/types";
import { Button } from "@/shared/shadcn/ui/button";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";

type ViewMode = "week" | "day";

const ISO_WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const GRID_START_HOUR = 7;
const GRID_END_HOUR = 21;
const HOUR_HEIGHT = 60; // px per hour

/** Parse "HH:mm" or "HH:mm:ss" → minutes since midnight */
function toMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
}

/** Strip seconds */
function fmtTime(t: string | null | undefined): string {
    if (!t) return "";
    const p = t.split(":");
    return p.length >= 2 ? `${p[0]}:${p[1]}` : t;
}

export function SchedulePage() {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [showAddExam, setShowAddExam] = useState(false);
    const [now, setNow] = useState(new Date());

    // Live clock for current time indicator
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    // Date range for query
    const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(anchorDate, { weekStartsOn: 1 });
    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(viewMode === "week" ? weekEnd : anchorDate, "yyyy-MM-dd");

    const { data: instances = [], isLoading } = useSchedule(from, to);

    // Group by date
    const byDate = useMemo(() => {
        const map: Record<string, LessonInstance[]> = {};
        instances.forEach(inst => {
            if (!map[inst.date]) map[inst.date] = [];
            map[inst.date].push(inst);
        });
        Object.values(map).forEach(arr =>
            arr.sort((a, b) => (a.startsAt ?? "99:99").localeCompare(b.startsAt ?? "99:99"))
        );
        return map;
    }, [instances]);

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // ── Stats ──
    const stats = useMemo(() => {
        const lessons = instances.filter(i => i.source !== "exam");
        const exams = instances.filter(i => i.source === "exam");
        let busiest = { day: "", count: 0 };
        Object.entries(byDate).forEach(([date, items]) => {
            if (items.length > busiest.count) busiest = { day: date, count: items.length };
        });
        return { lessonsCount: lessons.length, examsCount: exams.length, busiest };
    }, [instances, byDate]);

    // ── Day view data ──
    const todayStr = format(anchorDate, "yyyy-MM-dd");
    const dayInstances = byDate[todayStr] ?? [];
    const isRealToday = todayStr === format(new Date(), "yyyy-MM-dd");

    // ── Next lesson + day progress ──
    const { nextLesson, dayProgress, completedCount } = useMemo(() => {
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const todaysLessons = byDate[format(new Date(), "yyyy-MM-dd")] ?? [];

        let next: LessonInstance | null = null;
        let completed = 0;
        for (const inst of todaysLessons) {
            const start = toMinutes(inst.startsAt);
            const end = inst.endsAt ? toMinutes(inst.endsAt) : start + 90;
            if (end <= nowMinutes) {
                completed++;
            } else if (!next && start > nowMinutes) {
                next = inst;
            }
        }

        const total = todaysLessons.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { nextLesson: next, dayProgress: progress, completedCount: completed };
    }, [byDate, now]);

    // Minutes until next lesson
    const minutesUntilNext = useMemo(() => {
        if (!nextLesson) return 0;
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return toMinutes(nextLesson.startsAt) - nowMin;
    }, [nextLesson, now]);

    function prev() {
        setAnchorDate(d => addDays(d, viewMode === "week" ? -7 : -1));
    }
    function next() {
        setAnchorDate(d => addDays(d, viewMode === "week" ? 7 : 1));
    }
    function goToday() {
        setAnchorDate(new Date());
    }
    function goToDay(date: Date) {
        setAnchorDate(date);
        setViewMode("day");
    }

    const headerTitle = viewMode === "week"
        ? `${format(weekStart, "d MMM", { locale: uk })} — ${format(weekEnd, "d MMM yyyy", { locale: uk })}`
        : format(anchorDate, "EEEE, d MMMM yyyy", { locale: uk });

    // ── Current time indicator position (for day view grid) ──
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowOffset = ((nowMinutes - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT;

    return (
        <div className="flex flex-col gap-4 h-full min-h-0">
            {/* ── Toolbar ─────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prev} aria-label="Попередній">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToday}>
                        Сьогодні
                    </Button>
                    <Button variant="outline" size="icon" onClick={next} aria-label="Наступний">
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                    <span className="text-base font-semibold text-foreground ml-1 capitalize">
                        {headerTitle}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "week" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}
                            onClick={() => setViewMode("week")}
                        >
                            Тиждень
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "day" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}
                            onClick={() => setViewMode("day")}
                        >
                            День
                        </button>
                    </div>

                    <Button onClick={() => setShowAddLesson(true)} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Пара
                    </Button>
                    <Button onClick={() => setShowAddExam(true)} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        Іспит
                    </Button>
                </div>
            </div>

            {/* ── Info Bar (stats + next lesson + progress) ────── */}
            {!isLoading && (
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    {/* Stats */}
                    {viewMode === "week" && instances.length > 0 && (
                        <>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <BookOpenIcon className="w-3.5 h-3.5" />
                                <span>Пар: <span className="font-semibold text-foreground">{stats.lessonsCount}</span></span>
                            </div>
                            {stats.examsCount > 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <AlertCircleIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Іспитів: <span className="font-semibold text-amber-600">{stats.examsCount}</span></span>
                                </div>
                            )}
                            {stats.busiest.count > 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    <span>
                                        Найбільше:{" "}
                                        <span className="font-semibold text-foreground">
                                            {format(new Date(stats.busiest.day), "EEEE", { locale: uk })} ({stats.busiest.count})
                                        </span>
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Next lesson timer (always, for today) */}
                    {nextLesson && (
                        <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                            <TimerIcon className="w-3.5 h-3.5 text-primary" />
                            <span>
                                Наступна пара через{" "}
                                <span className="font-semibold text-primary">
                                    {minutesUntilNext >= 60
                                        ? `${Math.floor(minutesUntilNext / 60)} год ${minutesUntilNext % 60 > 0 ? `${minutesUntilNext % 60} хв` : ""}`
                                        : `${minutesUntilNext} хв`
                                    }
                                </span>
                                {" "}— {nextLesson.subject.name}
                            </span>
                        </div>
                    )}

                    {/* Day progress */}
                    {(byDate[format(new Date(), "yyyy-MM-dd")] ?? []).length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-xs">Прогрес дня:</span>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${dayProgress}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                {completedCount}/{(byDate[format(new Date(), "yyyy-MM-dd")] ?? []).length}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Main Content ────────────────────────────────── */}
            <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
                {/* Mini calendar (sidebar) */}
                <div className="hidden lg:block">
                    <MiniCalendar selectedDate={anchorDate} onSelectDate={goToDay} />
                </div>

                {/* Schedule content */}
                <div className="flex-1 min-w-0 overflow-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <Skeleton className="h-10 rounded-lg" />
                                    <Skeleton className="h-20 rounded-lg" />
                                    <Skeleton className="h-14 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : viewMode === "week" ? (
                        /* ── Week view ── */
                        <div className="overflow-x-auto pb-2 -mx-1 px-1">
                            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                                {weekDays.map((day, idx) => {
                                    const dateStr = format(day, "yyyy-MM-dd");
                                    const dayItems = byDate[dateStr] ?? [];
                                    const dayIsToday = dateStr === format(new Date(), "yyyy-MM-dd");
                                    const isOverloaded = dayItems.length >= 4;

                                    return (
                                        <div key={dateStr} className="flex flex-col gap-2 min-w-0">
                                            {/* Day header — clickable */}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => goToDay(day)}
                                                            className={`
                                                                flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left
                                                                transition-all duration-150 hover:bg-muted cursor-pointer
                                                                ${dayIsToday
                                                                    ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
                                                                    : "border-border bg-card"
                                                                }
                                                                ${isOverloaded && !dayIsToday ? "bg-amber-500/5 border-amber-500/30" : ""}
                                                            `}
                                                        >
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                {ISO_WEEKDAYS[idx]}
                                                            </span>
                                                            <span
                                                                className={`
                                                                    text-sm font-bold
                                                                    ${dayIsToday
                                                                        ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground"
                                                                        : "text-foreground"
                                                                    }
                                                                `}
                                                            >
                                                                {format(day, "d")}
                                                            </span>
                                                            {dayItems.length > 0 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`ml-auto text-[0.6rem] h-4 px-1.5 ${isOverloaded ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : ""}`}
                                                                >
                                                                    {dayItems.length}
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Натисніть щоб перейти до денного виду</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {/* Day cards */}
                                            <div className="flex flex-col gap-1.5">
                                                {dayItems.length === 0 ? (
                                                    <div className="text-center text-muted-foreground/50 text-sm py-4">—</div>
                                                ) : (
                                                    dayItems.map((inst, i) => (
                                                        <LessonCard key={`${inst.source}-${inst.id}-${i}`} instance={inst} />
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* ── Day view (time grid) ── */
                        <div className="max-w-3xl">
                            {dayInstances.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                                    <CalendarDaysIcon className="w-10 h-10 opacity-30" />
                                    <p className="text-sm">Занять на цей день немає</p>
                                    <Button variant="outline" size="sm" onClick={() => setShowAddLesson(true)}>
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Запланувати пару
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative" style={{ height: (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT }}>
                                    {/* Hour lines */}
                                    {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }).map((_, i) => {
                                        const hour = GRID_START_HOUR + i;
                                        return (
                                            <div
                                                key={hour}
                                                className="absolute left-0 right-0 flex items-start"
                                                style={{ top: i * HOUR_HEIGHT }}
                                            >
                                                <span className="w-12 shrink-0 text-[0.65rem] font-medium text-muted-foreground -mt-2 text-right pr-3">
                                                    {String(hour).padStart(2, "0")}:00
                                                </span>
                                                <div className="flex-1 border-t border-border/50" />
                                            </div>
                                        );
                                    })}

                                    {/* Current time indicator */}
                                    {isRealToday && nowMinutes >= GRID_START_HOUR * 60 && nowMinutes <= GRID_END_HOUR * 60 && (
                                        <div
                                            className="absolute left-10 right-0 z-20 flex items-center"
                                            style={{ top: nowOffset }}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0 shadow-sm shadow-red-500/50" />
                                            <div className="flex-1 h-[2px] bg-red-500 shadow-sm shadow-red-500/30" />
                                        </div>
                                    )}

                                    {/* Lesson cards positioned on grid */}
                                    {dayInstances.map((inst, i) => {
                                        const startMin = toMinutes(inst.startsAt);
                                        const endMin = inst.endsAt ? toMinutes(inst.endsAt) : startMin + 90;
                                        const top = ((startMin - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                                        const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 40);

                                        return (
                                            <div
                                                key={`${inst.source}-${inst.id}-${i}`}
                                                className="absolute left-14 right-2 z-10"
                                                style={{ top, height }}
                                            >
                                                <LessonCard
                                                    instance={inst}
                                                    expanded={height > 70}
                                                    style={{ height: "100%", overflow: "hidden" }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ──────────────────────────────────────── */}
            {showAddLesson && <AddLessonModal onClose={() => setShowAddLesson(false)} />}
            {showAddExam && <AddExamModal onClose={() => setShowAddExam(false)} />}
        </div>
    );
}
