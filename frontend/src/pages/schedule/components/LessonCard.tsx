import type { LessonInstance } from "@/entities/schedule/model/types";
import { MapPinIcon, WifiIcon, WifiOffIcon, UserIcon, StickyNoteIcon, Trash2Icon, Edit2Icon } from "lucide-react";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";

interface Props {
    instance: LessonInstance;
    expanded?: boolean;
    onDelete?: (instance: LessonInstance) => void;
    onEdit?: (instance: LessonInstance) => void;
    /** Absolute positioning mode for time-grid layout */
    style?: React.CSSProperties;
}

/** Strip seconds from "HH:mm:ss" → "HH:mm" */
function fmtTime(t: string | null | undefined): string {
    if (!t) return "";
    const parts = t.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

export function LessonCard({ instance, expanded, onDelete, onEdit, style }: Props) {
    const accentColor = instance.subject.color ?? "#6366f1";
    const isExam = instance.source === "exam";
    const isException = instance.source === "exception";

    const deliveryIcon =
        instance.deliveryMode?.code === "online" ? <WifiIcon className="w-3 h-3" /> :
            instance.deliveryMode?.code === "offline" ? <WifiOffIcon className="w-3 h-3" /> : null;

    const startTime = fmtTime(instance.startsAt);
    const endTime = fmtTime(instance.endsAt);

    const cardAccent = isExam ? "#f59e0b" : isException ? "#94a3b8" : accentColor;

    return (
        <div
            className={`
                relative rounded-lg border border-border overflow-hidden cursor-default
                transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group/lesson
                ${expanded ? "p-4 pl-5" : "p-2.5 pl-3.5"}
            `}
            style={{
                background: `linear-gradient(135deg, ${cardAccent}10 0%, ${cardAccent}05 40%, var(--card) 100%)`,
                borderColor: `color-mix(in srgb, ${cardAccent} 20%, var(--border))`,
                ...style,
            }}
        >
            {/* Color accent bar */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ backgroundColor: cardAccent }}
            />

            {/* ── Time ── */}
            {startTime && (
                <div className={`font-semibold mb-0.5 ${expanded ? "text-sm" : "text-[0.7rem]"}`}
                    style={{ color: cardAccent }}>
                    {startTime}
                    {endTime && ` – ${endTime}`}
                </div>
            )}

            {/* ── Subject name ── */}
            <div className={`font-semibold text-foreground truncate mb-1 ${expanded ? "text-base" : "text-[0.8rem]"}`}>
                {instance.subject.name}
            </div>

            {/* ── Teacher (always visible) ── */}
            {instance.subject.teacherName && (
                <div className="flex items-center gap-1 text-muted-foreground mb-1.5 text-[0.7rem]">
                    <UserIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{instance.subject.teacherName}</span>
                </div>
            )}

            {/* ── Badges row ── */}
            <div className="flex flex-wrap items-center gap-1">
                {instance.lessonType && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="secondary"
                                    className="text-[0.6rem] h-4 px-1.5"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                                        color: accentColor,
                                    }}
                                >
                                    {instance.lessonType.name}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Тип заняття</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {instance.examType && (
                    <Badge variant="secondary" className="text-[0.6rem] h-4 px-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        {instance.examType.name}
                    </Badge>
                )}

                {deliveryIcon && instance.deliveryMode && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-[0.6rem] h-4 px-1.5 gap-0.5">
                                    {deliveryIcon}
                                    {instance.deliveryMode.name}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Формат проведення</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {instance.location && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-[0.6rem] h-4 px-1.5 gap-0.5 max-w-[120px]">
                                    <MapPinIcon className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{instance.location}</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{instance.location}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* ── Note (expanded only) ── */}
            {expanded && instance.note && (
                <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    <StickyNoteIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{instance.note}</span>
                </div>
            )}

            {/* ── Hover actions ── */}
            {(onEdit || onDelete) && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); onEdit(instance); }}
                        >
                            <Edit2Icon className="w-3 h-3" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); onDelete(instance); }}
                        >
                            <Trash2Icon className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
