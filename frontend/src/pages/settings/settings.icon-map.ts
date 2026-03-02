import type { LucideIcon } from "lucide-react"
import {
    SunIcon, MoonIcon, MonitorIcon,
    EyeIcon, EyeOffIcon,
    GlobeIcon,
    ZapIcon, ScaleIcon, BrainCircuitIcon,
    KanbanIcon, ListIcon, TableIcon,
    CalendarDaysIcon, ClockIcon,
    ImageIcon, AlignJustifyIcon,
} from "lucide-react"

/**
 * Frontend-only map from setting *value strings* to Lucide icons.
 * The backend is unaware of this — it only knows value strings.
 *
 * Keys: the `value` field that comes from `SettingValue.value`
 */
export const SETTING_VALUE_ICON_MAP: Record<string, LucideIcon> = {
    // Appearance — theme
    "light": SunIcon,
    "dark": MoonIcon,
    "system": MonitorIcon,

    // AI — model
    "fast": ZapIcon,
    "balanced": ScaleIcon,
    "advanced": BrainCircuitIcon,

    // Organizer — view
    "kanban": KanbanIcon,
    "list": ListIcon,
    "table": TableIcon,

    // Privacy — profile visibility
    "everyone": GlobeIcon,
    "friends": EyeIcon,
    "nobody": EyeOffIcon,

    // Scheduler — view
    "day": CalendarDaysIcon,
    "week": CalendarDaysIcon,

    // Scheduler — reminder
    "15": ClockIcon,
    "30": ClockIcon,
    "60": ClockIcon,

    // Files — preview quality
    "low": ImageIcon,
    "medium": ImageIcon,
    "high": ImageIcon,

    // AI — creativity / language
    "auto": GlobeIcon,
    "uk": GlobeIcon,
    "en": GlobeIcon,
    "pl": GlobeIcon,
    "low_cr": AlignJustifyIcon,   // avoid key clash with "low" quality
}
