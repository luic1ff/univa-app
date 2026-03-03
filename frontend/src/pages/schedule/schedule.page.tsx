import React, { useEffect, useMemo, useState } from "react";
import {
    addDays, addMonths, endOfMonth, endOfWeek,
    format, startOfMonth, startOfWeek, startOfYear,
} from "date-fns";
import { uk } from "date-fns/locale";
import {
    BookOpenIcon, CalendarDaysIcon,
    ChevronLeftIcon, ChevronRightIcon, ClockIcon,
    FlaskConicalIcon, GraduationCapIcon, MapPinIcon,
    MessageSquareIcon, MonitorIcon, PlusIcon,
    TimerIcon, UserIcon, WifiIcon, ZapIcon,
} from "lucide-react";

import { useSchedule } from "@/entities/schedule/api/hooks";
import { AddLessonModal } from "./components/AddLessonModal";
import { AddExamModal } from "./components/AddExamModal";
import type { LessonInstance } from "@/entities/schedule/model/types";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

/* ─────────────────────────────────────────────────────────── */
/*  Constants & helpers                                         */
/* ─────────────────────────────────────────────────────────── */

type ViewMode = "semester" | "month" | "week" | "day";

const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт"];

const SLOT_START  = 8 * 60;       // 08:00
const SLOT_END    = 20 * 60;      // 20:00
const PX_PER_MIN  = 1.6;          // 96px / hour
const GRID_HEIGHT = (SLOT_END - SLOT_START) * PX_PER_MIN;
const HOURS       = Array.from({ length: (SLOT_END - SLOT_START) / 60 + 1 }, (_, i) => SLOT_START / 60 + i);

function toMin(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m ?? 0);
}
function fmtTime(t: string | null | undefined): string {
    if (!t) return "";
    const p = t.split(":");
    return `${p[0]}:${p[1]}`;
}
function minToTop(min: number): number {
    return (min - SLOT_START) * PX_PER_MIN;
}
function durationToPx(sm: number, em: number): number {
    return Math.max((em - sm) * PX_PER_MIN - 2, 32);
}

/* ─────────────────────────────────────────────────────────── */
/*  Small shared UI pieces                                      */
/* ─────────────────────────────────────────────────────────── */

function LessonTypeIcon({ code, className }: { code: string; className?: string }) {
    const cls = `w-3 h-3 shrink-0 ${className ?? ""}`;
    if (code === "lecture")      return <BookOpenIcon className={cls} />;
    if (code === "practice")     return <ZapIcon className={cls} />;
    if (code === "lab")          return <FlaskConicalIcon className={cls} />;
    if (code === "seminar")      return <MessageSquareIcon className={cls} />;
    if (code === "consultation") return <UserIcon className={cls} />;
    if (code === "exam")         return <GraduationCapIcon className={cls} />;
    return <BookOpenIcon className={cls} />;
}

function ModeBadge({ code }: { code: string }) {
    if (code === "online")
        return (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 dark:bg-sky-900/40 dark:text-sky-400 px-1.5 py-0.5 rounded-full">
                <WifiIcon className="w-2.5 h-2.5" />Онлайн
            </span>
        );
    if (code === "hybrid")
        return (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400 px-1.5 py-0.5 rounded-full">
                <MonitorIcon className="w-2.5 h-2.5" />Гібрид
            </span>
        );
    return null;
}

/* ─────────────────────────────────────────────────────────── */
/*  EventCard — time-grid event block                           */
/* ─────────────────────────────────────────────────────────── */

interface EventCardProps {
    inst: LessonInstance;
    style?: React.CSSProperties;
    compact?: boolean;
}

function EventCard({ inst, style, compact }: EventCardProps) {
    const accent = inst.subject?.color ?? "#6366f1";
    const isExam = inst.source === "exam";

    return (
        <div
            className="absolute left-1 right-1 rounded-xl overflow-hidden transition-all duration-150 hover:z-30 hover:shadow-xl hover:-translate-y-px cursor-pointer select-none"
            style={{
                ...style,
                background: `${accent}12`,
                borderLeft: `3px solid ${accent}`,
                border: `1px solid ${accent}25`,
                borderLeftWidth: 3,
                borderLeftColor: accent,
            }}
        >
            {/* Gradient sheen */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(160deg, ${accent}18 0%, transparent 55%)` }}
            />

            <div className="relative px-2.5 pt-2 pb-1.5 h-full flex flex-col gap-0.5">
                {/* Time + badges */}
                <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: `${accent}cc` }}>
                        {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                    </span>
                    <div className="flex items-center gap-1">
                        {!compact && <ModeBadge code={inst.deliveryMode?.code ?? "offline"} />}
                        {isExam && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                                Іспит
                            </span>
                        )}
                    </div>
                </div>

                {/* Subject name */}
                <div className="text-[12px] font-black leading-tight" style={{ color: accent }}>
                    {inst.subject?.name ?? "Предмет"}
                </div>

                {!compact && (
                    <>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-auto pt-0.5">
                            {inst.lessonType && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <LessonTypeIcon code={inst.lessonType.code} />
                                    {inst.lessonType.name}
                                </span>
                            )}
                            {inst.location && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MapPinIcon className="w-2.5 h-2.5 shrink-0" />
                                    {inst.location}
                                </span>
                            )}
                        </div>
                        {inst.subject?.teacherName && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                <UserIcon className="w-2.5 h-2.5 shrink-0" />
                                {inst.subject.teacherName}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Time column                                                 */
/* ─────────────────────────────────────────────────────────── */

function TimeColumn() {
    return (
        <div className="w-14 shrink-0 relative select-none" style={{ height: GRID_HEIGHT }}>
            {HOURS.map((h, i) => (
                <div
                    key={h}
                    className="absolute right-3 text-[10px] font-semibold tabular-nums text-muted-foreground/60"
                    style={{ top: i * 60 * PX_PER_MIN - 7 }}
                >
                    {String(h).padStart(2, "0")}:00
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Current time indicator                                      */
/* ─────────────────────────────────────────────────────────── */

function NowLine({ now }: { now: Date }) {
    const min = now.getHours() * 60 + now.getMinutes();
    if (min < SLOT_START || min > SLOT_END) return null;
    return (
        <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: minToTop(min) }}
        >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0 shadow-md shadow-red-500/50" />
            <div className="flex-1 h-[1.5px] bg-red-500/70" />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Semester view                                               */
/* ─────────────────────────────────────────────────────────── */

const PALETTES = [
    { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-700/40", dot: "bg-violet-500", bar: "bg-violet-400/70" },
    { bg: "bg-sky-50 dark:bg-sky-950/30",       border: "border-sky-200 dark:border-sky-700/40",       dot: "bg-sky-500",    bar: "bg-sky-400/70"    },
    { bg: "bg-emerald-50 dark:bg-emerald-950/30",border:"border-emerald-200 dark:border-emerald-700/40",dot: "bg-emerald-500",bar: "bg-emerald-400/70" },
    { bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-700/40",   dot: "bg-amber-500",  bar: "bg-amber-400/70"  },
    { bg: "bg-rose-50 dark:bg-rose-950/30",     border: "border-rose-200 dark:border-rose-700/40",     dot: "bg-rose-500",   bar: "bg-rose-400/70"   },
    { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-700/40", dot: "bg-indigo-500", bar: "bg-indigo-400/70" },
];

interface SemesterViewProps {
    instances: LessonInstance[];
    rangeStart: Date;
    byDate: Record<string, LessonInstance[]>;
    onMonthClick: (d: Date) => void;
}

function SemesterView({ instances, rangeStart, byDate, onMonthClick }: SemesterViewProps) {
    return (
        <div className="grid grid-cols-3 gap-3 h-full pb-2 pr-1 overscroll-y-none">
            {Array.from({ length: 6 }).map((_, i) => {
                const md    = addMonths(rangeStart, i);
                const ms    = startOfMonth(md);
                const me    = endOfMonth(md);
                const pal   = PALETTES[i];
                const items = instances.filter(inst => { const d = new Date(inst.date); return d >= ms && d <= me; });
                const exams = items.filter(x => x.source === "exam").length;
                const isCur = format(md, "yyyy-MM") === format(new Date(), "yyyy-MM");
                const days  = me.getDate();
                const maxD  = Math.max(1, ...Array.from({ length: days }, (_, d) =>
                    (byDate[format(addDays(ms, d), "yyyy-MM-dd")] ?? []).length
                ));

                return (
                    <button
                        key={i}
                        onClick={() => onMonthClick(md)}
                        className={[
                            "relative text-left p-5 rounded-2xl border transition-all duration-200",
                            "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
                            pal.bg, pal.border,
                            isCur ? "ring-2 ring-primary/30 ring-offset-2" : "",
                        ].join(" ")}
                    >
                        {isCur && (
                            <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Зараз
                            </span>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pal.dot}`} />
                            <span className="font-bold text-sm capitalize tracking-tight">
                                {format(md, "LLLL yyyy", { locale: uk })}
                            </span>
                        </div>

                        <div className="flex items-end justify-between mb-3">
                            <div>
                                <span className="text-4xl font-black tabular-nums leading-none">{items.length}</span>
                                <span className="text-xs text-muted-foreground ml-2">подій</span>
                            </div>
                            <div className="text-right text-xs text-muted-foreground space-y-0.5">
                                <div>{items.length - exams} пар</div>
                                {exams > 0 && (
                                    <div className="text-amber-600 font-bold">
                                        {exams} іспит{exams === 1 ? "" : exams < 5 ? "и" : "ів"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sparkline bar chart */}
                        <div className="flex items-end gap-px h-8">
                            {Array.from({ length: days }).map((_, d) => {
                                const cnt = (byDate[format(addDays(ms, d), "yyyy-MM-dd")] ?? []).length;
                                return (
                                    <div
                                        key={d}
                                        className={`flex-1 rounded-[1px] ${cnt > 0 ? pal.bar : "bg-black/5 dark:bg-white/5"}`}
                                        style={{ height: cnt > 0 ? `${Math.max((cnt / maxD) * 100, 18)}%` : "6%" }}
                                    />
                                );
                            })}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Month view                                                  */
/* ─────────────────────────────────────────────────────────── */

interface MonthViewProps {
    rangeStart: Date;
    rangeEnd: Date;
    byDate: Record<string, LessonInstance[]>;
    onDayClick: (d: Date) => void;
}

function MonthView({ rangeStart, rangeEnd, byDate, onDayClick }: MonthViewProps) {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const firstDow = (rangeStart.getDay() + 6) % 7;
    const total    = rangeEnd.getDate();
    const cells    = Math.ceil((firstDow + total) / 7) * 7;
    const HDRS     = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

    return (
        <div className="flex flex-col h-full pb-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1.5 sticky top-0 bg-background z-10">
                {HDRS.map((d, i) => (
                    <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-widest py-2 ${i >= 5 ? "text-muted-foreground/40" : "text-muted-foreground/70"}`}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: cells }).map((_, idx) => {
                    const dayIdx = idx - firstDow;
                    if (dayIdx < 0 || dayIdx >= total) {
                        return <div key={idx} className="rounded-xl min-h-[80px] bg-muted/10 border border-transparent" />;
                    }

                    const day      = addDays(rangeStart, dayIdx);
                    const dateStr  = format(day, "yyyy-MM-dd");
                    const items    = byDate[dateStr] ?? [];
                    const isToday  = dateStr === todayStr;
                    const dow      = (day.getDay() + 6) % 7;
                    const isWeekend = dow >= 5;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={[
                                "text-left rounded-xl border p-1.5 min-h-[80px] transition-all duration-100 group",
                                "hover:shadow-sm active:scale-[0.98]",
                                isToday    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 ring-offset-0" : "",
                                isWeekend && !isToday ? "bg-muted/15 border-border/30" : "",
                                !isToday && !isWeekend ? "bg-card border-border/60 hover:border-primary/25 hover:bg-muted/20" : "",
                            ].join(" ")}
                        >
                            <div className={[
                                "w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mb-1.5 transition-colors",
                                isToday    ? "bg-primary text-primary-foreground" : "text-foreground/80 group-hover:bg-muted",
                                isWeekend && !isToday ? "text-muted-foreground/50" : "",
                            ].join(" ")}>
                                {format(day, "d")}
                            </div>

                            <div className="flex flex-col gap-0.5">
                                {items.slice(0, 3).map((inst, ii) => {
                                    const accent = inst.subject?.color ?? "#6366f1";
                                    return (
                                        <div
                                            key={`${inst.id}-${ii}`}
                                            className="flex items-center gap-1 rounded-md px-1 py-0.5"
                                            style={{ backgroundColor: `${accent}18` }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                                            <span className="text-[10px] font-semibold truncate" style={{ color: accent }}>
                                                {fmtTime(inst.startsAt)} {inst.subject?.name}
                                            </span>
                                        </div>
                                    );
                                })}
                                {items.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground pl-1">+{items.length - 3}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Week view                                                   */
/* ─────────────────────────────────────────────────────────── */

interface WeekViewProps {
    weekDays: Date[];
    byDate: Record<string, LessonInstance[]>;
    now: Date;
    onDayClick: (d: Date) => void;
}

function WeekView({ weekDays, byDate, now, onDayClick }: WeekViewProps) {
    const todayStr = format(new Date(), "yyyy-MM-dd");

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Column headers */}
            <div className="flex border-b border-border shrink-0">
                <div className="w-14 shrink-0" />
                {weekDays.map((day, idx) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isToday = dateStr === todayStr;
                    const count   = (byDate[dateStr] ?? []).length;
                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={[
                                "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors border-l border-border",
                                "hover:bg-muted/30",
                                isToday ? "bg-primary/5" : "",
                            ].join(" ")}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                {WEEKDAYS_SHORT[idx]}
                            </span>
                            <span className={[
                                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors",
                                isToday ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : "text-foreground",
                            ].join(" ")}>
                                {format(day, "d")}
                            </span>
                            {count > 0 ? (
                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                    {count} пар{count === 1 ? "а" : count < 5 ? "и" : ""}
                                </span>
                            ) : (
                                <span className="text-[10px] text-muted-foreground/30">—</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scrollable time grid */}
            <div className="flex-1">
                <div className="flex">
                    <TimeColumn />
                    {weekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const items   = byDate[dateStr] ?? [];
                        const isToday = dateStr === todayStr;

                        return (
                            <div
                                key={dateStr}
                                className={[
                                    "flex-1 relative border-l border-border/60",
                                    isToday ? "bg-primary/[0.025]" : "bg-background",
                                ].join(" ")}
                                style={{ height: GRID_HEIGHT }}
                            >
                                {/* Hour lines */}
                                {HOURS.map((h, i) => (
                                    <div
                                        key={h}
                                        className={`absolute left-0 right-0 border-t ${i % 2 === 0 ? "border-border/50" : "border-border/20"}`}
                                        style={{ top: i * 60 * PX_PER_MIN }}
                                    />
                                ))}

                                {isToday && <NowLine now={now} />}

                                {items.map((inst, ii) => {
                                    const sm = toMin(inst.startsAt);
                                    const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;
                                    return (
                                        <EventCard
                                            key={`${inst.source}-${inst.id}-${ii}`}
                                            inst={inst}
                                            compact={durationToPx(sm, em) < 60}
                                            style={{ top: minToTop(sm), height: durationToPx(sm, em) }}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  Day view                                                    */
/* ─────────────────────────────────────────────────────────── */

interface DayViewProps {
    dateStr: string;
    instances: LessonInstance[];
    now: Date;
    isToday: boolean;
    onAddLesson: () => void;
}

function DayView({ dateStr, instances, now, isToday, onAddLesson }: DayViewProps) {
    const date   = new Date(dateStr + "T12:00:00");
    const nowMin = now.getHours() * 60 + now.getMinutes();

    if (instances.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <CalendarDaysIcon className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <div>
                    <p className="font-bold text-foreground">Вільний день</p>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {format(date, "EEEE, d MMMM", { locale: uk })} — занять немає
                    </p>
                </div>
                <button
                    onClick={onAddLesson}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Додати пару
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* Time grid */}
            <div className="flex-1 min-w-0">
                <div className="flex max-w-2xl">
                    <TimeColumn />
                    <div className="flex-1 relative" style={{ height: GRID_HEIGHT }}>
                        {HOURS.map((h, i) => (
                            <div
                                key={h}
                                className={`absolute left-0 right-0 border-t ${i % 2 === 0 ? "border-border/50" : "border-border/20"}`}
                                style={{ top: i * 60 * PX_PER_MIN }}
                            />
                        ))}
                        {isToday && <NowLine now={now} />}
                        {instances.map((inst, ii) => {
                            const sm = toMin(inst.startsAt);
                            const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;
                            return (
                                <EventCard
                                    key={`${inst.source}-${inst.id}-${ii}`}
                                    inst={inst}
                                    compact={false}
                                    style={{ top: minToTop(sm), height: durationToPx(sm, em) }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right panel — lesson list */}
            <div className="hidden lg:flex w-60 xl:w-72 shrink-0 flex-col gap-2 pb-4 pr-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 pt-0.5 sticky top-0 bg-background">
                    {format(date, "EEEE, d MMMM", { locale: uk })}
                </p>

                {instances.map((inst, ii) => {
                    const accent   = inst.subject?.color ?? "#6366f1";
                    const endMin   = inst.endsAt ? toMin(inst.endsAt) : toMin(inst.startsAt) + 90;
                    const startMin = toMin(inst.startsAt);
                    const isPast   = endMin < nowMin && isToday;
                    const isActive = startMin <= nowMin && endMin >= nowMin && isToday;

                    return (
                        <div
                            key={`side-${inst.id}-${ii}`}
                            className={[
                                "rounded-xl border p-3 transition-all duration-200",
                                isActive ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "",
                                isPast   ? "opacity-45" : "",
                                !isActive && !isPast ? "border-border/60 bg-card hover:border-border hover:shadow-sm" : "",
                            ].join(" ")}
                        >
                            <div className="flex gap-2.5">
                                {/* Accent bar */}
                                <div
                                    className="w-[3px] rounded-full shrink-0 self-stretch"
                                    style={{ backgroundColor: accent, minHeight: 48 }}
                                />
                                <div className="flex-1 min-w-0">
                                    {/* Time + active badge */}
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                                            {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                                        </span>
                                        {isActive && (
                                            <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                                                Зараз
                                            </span>
                                        )}
                                    </div>

                                    {/* Subject */}
                                    <p className="text-xs font-black leading-tight" style={{ color: accent }}>
                                        {inst.subject?.name}
                                    </p>

                                    {/* Meta */}
                                    <div className="mt-1.5 flex flex-col gap-0.5">
                                        {inst.lessonType && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <LessonTypeIcon code={inst.lessonType.code} />
                                                {inst.lessonType.name}
                                            </div>
                                        )}
                                        {inst.location && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <MapPinIcon className="w-2.5 h-2.5 shrink-0" />
                                                {inst.location}
                                            </div>
                                        )}
                                        {inst.subject?.teacherName && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                                <UserIcon className="w-2.5 h-2.5 shrink-0" />
                                                {inst.subject.teacherName}
                                            </div>
                                        )}
                                        <ModeBadge code={inst.deliveryMode?.code ?? "offline"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/*  SchedulePage                                                */
/* ─────────────────────────────────────────────────────────── */

export function SchedulePage() {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [showAddExam,   setShowAddExam]   = useState(false);
    const [now, setNow] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(id);
    }, []);

    const range = useMemo(() => {
        if (viewMode === "week")
            return { start: startOfWeek(anchorDate, { weekStartsOn: 1 }), end: endOfWeek(anchorDate, { weekStartsOn: 1 }) };
        if (viewMode === "month")
            return { start: startOfMonth(anchorDate), end: endOfMonth(anchorDate) };
        if (viewMode === "semester") {
            const s = startOfYear(anchorDate);
            return { start: s, end: addMonths(s, 6) };
        }
        return { start: anchorDate, end: anchorDate };
    }, [anchorDate, viewMode]);

    const { data: instances = [], isLoading } = useSchedule(
        format(range.start, "yyyy-MM-dd"),
        format(range.end,   "yyyy-MM-dd"),
    );

    const byDate = useMemo(() => {
        const map: Record<string, LessonInstance[]> = {};
        instances.forEach(inst => {
            if (!map[inst.date]) map[inst.date] = [];
            map[inst.date].push(inst);
        });
        Object.values(map).forEach(arr =>
            arr.sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""))
        );
        return map;
    }, [instances]);

    const weekDays = useMemo(
        () => viewMode === "week" ? Array.from({ length: 5 }, (_, i) => addDays(range.start, i)) : [],
        [range, viewMode]
    );

    const todayStr         = format(new Date(), "yyyy-MM-dd");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const todayInstances   = byDate[todayStr] ?? [];
    const activeDayStr     = selectedDay ?? format(anchorDate, "yyyy-MM-dd");
    const activeDayInstances = byDate[activeDayStr] ?? [];

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const { nextLesson, minutesUntilNext } = useMemo(() => {
        let next: LessonInstance | null = null;
        for (const inst of todayInstances) {
            if (toMin(inst.startsAt) > nowMin && !next) next = inst;
        }
        return { nextLesson: next, minutesUntilNext: next ? toMin(next.startsAt) - nowMin : 0 };
    }, [todayInstances, nowMin]);

    const completedToday = todayInstances.filter(i => {
        const end = i.endsAt ? toMin(i.endsAt) : toMin(i.startsAt) + 90;
        return end <= nowMin;
    }).length;

    function prev() {
        setAnchorDate(d => {
            if (viewMode === "week")     return addDays(d, -7);
            if (viewMode === "month")    return addMonths(d, -1);
            if (viewMode === "semester") return addMonths(d, -6);
            return addDays(d, -1);
        });
    }
    function next() {
        setAnchorDate(d => {
            if (viewMode === "week")     return addDays(d, 7);
            if (viewMode === "month")    return addMonths(d, 1);
            if (viewMode === "semester") return addMonths(d, 6);
            return addDays(d, 1);
        });
    }
    function goToday() { setAnchorDate(new Date()); setSelectedDay(null); }
    function goDay(date: Date) { setAnchorDate(date); setSelectedDay(format(date, "yyyy-MM-dd")); setViewMode("day"); }

    const headerLabel = useMemo(() => {
        if (viewMode === "week")
            return `${format(range.start, "d MMM", { locale: uk })} — ${format(range.end, "d MMM yyyy", { locale: uk })}`;
        if (viewMode === "month")
            return format(anchorDate, "LLLL yyyy", { locale: uk });
        if (viewMode === "semester")
            return `${format(range.start, "MMM yyyy", { locale: uk })} — ${format(range.end, "MMM yyyy", { locale: uk })}`;
        return format(anchorDate, "EEEE, d MMMM", { locale: uk });
    }, [range, anchorDate, viewMode]);

    return (
        <div className="flex flex-col h-full min-h-0 gap-0">

            {/* ══ TOP BAR ════════════════════════════════════════ */}
            <div className="flex items-center justify-between pb-4 flex-wrap gap-3">
                {/* Navigation */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                        <button
                            onClick={prev}
                            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-r border-border"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={goToday}
                            className="h-9 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-r border-border"
                        >
                            Сьогодні
                        </button>
                        <button
                            onClick={next}
                            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <h1 className="text-lg font-black tracking-tight capitalize text-foreground">
                        {headerLabel}
                    </h1>
                </div>

                {/* View switcher + actions */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/50 border border-border/70 rounded-xl p-0.5 gap-0.5 shadow-sm">
                        {(["semester", "month", "week", "day"] as ViewMode[]).map(m => {
                            const label = { semester: "Семестр", month: "Місяць", week: "Тиждень", day: "День" }[m];
                            return (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={[
                                        "px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150",
                                        viewMode === m
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                                    ].join(" ")}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setShowAddLesson(true)}
                        className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Пара
                    </button>
                    <button
                        onClick={() => setShowAddExam(true)}
                        className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl bg-amber-500 text-white text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors"
                    >
                        <GraduationCapIcon className="w-3.5 h-3.5" />
                        Іспит
                    </button>
                </div>
            </div>

            {/* ══ STATUS STRIP ════════════════════════════════════ */}
            {!isLoading && todayInstances.length > 0 && (
                <div className="flex items-center gap-3 pb-3 flex-wrap">
                    {nextLesson ? (
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
                            <TimerIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">
                                Наступна пара через{" "}
                                <span className="font-bold text-primary">
                                    {minutesUntilNext >= 60
                                        ? `${Math.floor(minutesUntilNext / 60)}г ${minutesUntilNext % 60 > 0 ? `${minutesUntilNext % 60}хв` : ""}`
                                        : `${minutesUntilNext} хв`}
                                </span>
                                {" "}— {nextLesson.subject?.name}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                            Пари на сьогодні завершено
                        </div>
                    )}

                    {/* Day progress */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-muted-foreground">
                            {completedToday} / {todayInstances.length} пар
                        </span>
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-700"
                                style={{ width: `${Math.round((completedToday / todayInstances.length) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ══ CONTENT ══════════════════════════════════════════ */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {isLoading ? (
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-24 rounded-xl" />
                                <Skeleton className="h-16 rounded-xl" />
                                <Skeleton className="h-20 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : viewMode === "semester" ? (
                    <SemesterView
                        instances={instances}
                        rangeStart={range.start}
                        byDate={byDate}
                        onMonthClick={(d) => { setAnchorDate(d); setViewMode("month"); }}
                    />
                ) : viewMode === "month" ? (
                    <MonthView
                        rangeStart={range.start}
                        rangeEnd={range.end}
                        byDate={byDate}
                        onDayClick={goDay}
                    />
                ) : viewMode === "week" ? (
                    <WeekView
                        weekDays={weekDays}
                        byDate={byDate}
                        now={now}
                        onDayClick={goDay}
                    />
                ) : (
                    <DayView
                        dateStr={activeDayStr}
                        instances={activeDayInstances}
                        now={now}
                        isToday={activeDayStr === todayStr}
                        onAddLesson={() => setShowAddLesson(true)}
                    />
                )}
            </div>

            {showAddLesson && <AddLessonModal onClose={() => setShowAddLesson(false)} />}
            {showAddExam   && <AddExamModal   onClose={() => setShowAddExam(false)} />}
        </div>
    );
}