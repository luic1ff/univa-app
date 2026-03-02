import {
    UserIcon,
    ShieldCheckIcon,
    BellIcon,
    PaletteIcon,
    LockIcon,
    SparklesIcon,
    CalendarIcon,
    MessageSquareIcon,
    HardDriveIcon,
    LayoutListIcon,
    LinkIcon,
    Trash2Icon,
} from "lucide-react"
import type { TabDef } from "../settings.types"

// Group IDs mirror ApplicationSettingGroup PHP constants
export const SETTING_GROUP = {
    USER: 1001,
    SECURITY: 1002,
    NOTIFICATION: 1,
    APPEARANCE: 2,
    PRIVACY: 3,
    AI: 4,
    SCHEDULER: 5,
    CHAT: 6,
    FILE: 7,
    ORGANIZER: 8,
    INTEGRATION: 9,
    DANGER_ZONE: 10,
} as const;

export const tabs: TabDef[] = [
    // ── Загальне ──────────────────────────────────────────────────────────
    { id: "account", groupId: SETTING_GROUP.USER, label: "Аккаунт", icon: UserIcon, description: "Профіль, освіта та особисті дані", group: "Загальне" },
    { id: "security", groupId: SETTING_GROUP.SECURITY, label: "Безпека", icon: ShieldCheckIcon, description: "Пароль, 2FA, активні сесії" },
    { id: "notifications", groupId: SETTING_GROUP.NOTIFICATION, label: "Сповіщення", icon: BellIcon, description: "Email та push-повідомлення" },
    { id: "appearance", groupId: SETTING_GROUP.APPEARANCE, label: "Зовнішній вигляд", icon: PaletteIcon, description: "Тема, мова та інтерфейс" },
    { id: "privacy", groupId: SETTING_GROUP.PRIVACY, label: "Конфіденційність", icon: LockIcon, description: "Видимість профілю та дані" },
    // ── Модулі ────────────────────────────────────────────────────────────
    { id: "ai", groupId: SETTING_GROUP.AI, label: "AI-помічник", icon: SparklesIcon, description: "Модель, стиль та поведінка AI", badge: "Нове", group: "Модулі" },
    { id: "scheduler", groupId: SETTING_GROUP.SCHEDULER, label: "Розклад", icon: CalendarIcon, description: "Дедлайни, нагадування та формат" },
    { id: "chats", groupId: SETTING_GROUP.CHAT, label: "Чати", icon: MessageSquareIcon, description: "Повідомлення, медіа та звуки" },
    { id: "files", groupId: SETTING_GROUP.FILE, label: "Файли", icon: HardDriveIcon, description: "Сховище, синхронізація та перегляд" },
    { id: "organizer", groupId: SETTING_GROUP.ORGANIZER, label: "Органайзер", icon: LayoutListIcon, description: "Планер, нотатки та трекер" },
    // ── Інше ──────────────────────────────────────────────────────────────
    { id: "integrations", groupId: SETTING_GROUP.INTEGRATION, label: "Інтеграції", icon: LinkIcon, description: "Підключені сервіси", group: "Інше" },
    { id: "danger", groupId: SETTING_GROUP.DANGER_ZONE, label: "Небезпечна зона", icon: Trash2Icon, description: "Видалення аккаунту" },
]
