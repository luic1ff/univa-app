import { useState, useMemo } from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    format,
    isSameMonth,
    isSameDay,
    isToday,
} from "date-fns";
import { uk } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/shared/shadcn/ui/button";

interface Props {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export function MiniCalendar({ selectedDate, onSelectDate }: Props) {
    const [viewMonth, setViewMonth] = useState<Date>(selectedDate);

    const weeks = useMemo(() => {
        const monthStart = startOfMonth(viewMonth);
        const monthEnd = endOfMonth(viewMonth);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows: Date[][] = [];
        let day = calStart;
        while (day <= calEnd) {
            const week: Date[] = [];
            for (let i = 0; i < 7; i++) {
                week.push(day);
                day = addDays(day, 1);
            }
            rows.push(week);
        }
        return rows;
    }, [viewMonth]);

    return (
        <div className="w-[220px] shrink-0 select-none">
            {/* Month header */}
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon-xs" onClick={() => setViewMonth(d => subMonths(d, 1))}>
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                </Button>
                <span className="text-sm font-semibold text-foreground capitalize">
                    {format(viewMonth, "LLLL yyyy", { locale: uk })}
                </span>
                <Button variant="ghost" size="icon-xs" onClick={() => setViewMonth(d => addMonths(d, 1))}>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                </Button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAY_LABELS.map(l => (
                    <div key={l} className="text-center text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider py-1">
                        {l}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                    {week.map(day => {
                        const inMonth = isSameMonth(day, viewMonth);
                        const selected = isSameDay(day, selectedDate);
                        const today = isToday(day);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => onSelectDate(day)}
                                className={`
                                    h-7 w-full flex items-center justify-center text-xs rounded-md transition-all duration-100
                                    ${!inMonth ? "text-muted-foreground/40" : "text-foreground"}
                                    ${selected
                                        ? "bg-primary text-primary-foreground font-bold"
                                        : today
                                            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                                            : "hover:bg-muted"
                                    }
                                `}
                            >
                                {format(day, "d")}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
