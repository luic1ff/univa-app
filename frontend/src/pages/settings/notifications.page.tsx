import React, { useState } from "react"
import { motion } from "framer-motion"
import usePageTitle from "@/shared/hooks/usePageTitle"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/shadcn/ui/card"
import { Button } from "@/shared/shadcn/ui/button"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Badge } from "@/shared/shadcn/ui/badge"
import {
    BellIcon,
    BellRingIcon,
    CalendarCheckIcon,
    MessageSquareIcon,
    BotIcon,
    FileIcon,
    MegaphoneIcon,
    MailIcon,
    SmartphoneIcon,
} from "lucide-react"

// ── Types ───────────────────────────────────────────────────
interface NotificationSetting {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    email: boolean
    push: boolean
}

// ── Mock data ───────────────────────────────────────────────
const initialSettings: NotificationSetting[] = [
    {
        id: "deadlines",
        title: "Дедлайни",
        description: "Нагадування про наближення термінів здачі",
        icon: <CalendarCheckIcon className="size-4" />,
        email: true,
        push: true,
    },
    {
        id: "schedule",
        title: "Розклад",
        description: "Зміни у розкладі та нагадування про пари",
        icon: <BellRingIcon className="size-4" />,
        email: true,
        push: true,
    },
    {
        id: "messages",
        title: "Повідомлення",
        description: "Нові повідомлення в чатах та групових просторах",
        icon: <MessageSquareIcon className="size-4" />,
        email: false,
        push: true,
    },
    {
        id: "ai",
        title: "AI-помічник",
        description: "Готові результати аналізу та сгенеровані конспекти",
        icon: <BotIcon className="size-4" />,
        email: false,
        push: true,
    },
    {
        id: "files",
        title: "Файли",
        description: "Нові файли в групових просторах",
        icon: <FileIcon className="size-4" />,
        email: false,
        push: false,
    },
    {
        id: "announcements",
        title: "Оголошення",
        description: "Важливі оголошення від адміністрації",
        icon: <MegaphoneIcon className="size-4" />,
        email: true,
        push: true,
    },
]

// ── Animations ──────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

// ── Toggle component (no shadcn switch available) ──────────
function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean
    onChange: (v: boolean) => void
    label: string
}) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={[
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                checked ? "bg-primary" : "bg-input",
            ].join(" ")}
        >
            <span
                className={[
                    "pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-[18px]" : "translate-x-[3px]",
                ].join(" ")}
            />
        </button>
    )
}

// ── Component ───────────────────────────────────────────────
export function NotificationsPage() {
    usePageTitle("Сповіщення", { suffix: true })

    const [settings, setSettings] = useState(initialSettings)

    const updateSetting = (id: string, field: "email" | "push", value: boolean) => {
        setSettings((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        )
    }

    const enabledCount = settings.filter((s) => s.email || s.push).length

    return (
        <motion.div
            className="flex flex-col gap-6 max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* ─── Header ─── */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <BellIcon className="size-6 text-primary" />
                    Сповіщення
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Обери, які сповіщення ти хочеш отримувати
                </p>
            </motion.div>

            {/* ─── Summary ─── */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border">
                    <BellRingIcon className="size-5 text-primary" />
                    <p className="text-sm">
                        Активних категорій:{" "}
                        <Badge variant="secondary" className="ml-1">
                            {enabledCount} / {settings.length}
                        </Badge>
                    </p>
                </div>
            </motion.div>

            {/* ─── Settings list ─── */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Канали сповіщень</CardTitle>
                        <CardDescription>
                            Налаштуй окремо для email та push-повідомлень
                        </CardDescription>

                        {/* Column headers */}
                        <div className="flex items-center justify-end gap-6 pt-2 pr-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MailIcon className="size-3" />
                                Email
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <SmartphoneIcon className="size-3" />
                                Push
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col">
                        {settings.map((setting, index) => (
                            <div key={setting.id}>
                                {index > 0 && <Separator className="my-3" />}
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                                        {setting.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{setting.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Toggle
                                            checked={setting.email}
                                            onChange={(v) => updateSetting(setting.id, "email", v)}
                                            label={`${setting.title} email`}
                                        />
                                        <Toggle
                                            checked={setting.push}
                                            onChange={(v) => updateSetting(setting.id, "push", v)}
                                            label={`${setting.title} push`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* ─── Save ─── */}
            <motion.div variants={itemVariants} className="flex justify-end">
                <Button>Зберегти налаштування</Button>
            </motion.div>
        </motion.div>
    )
}
