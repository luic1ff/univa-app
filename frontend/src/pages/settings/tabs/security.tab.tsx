import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/shared/shadcn/ui/input"
import { Button } from "@/shared/shadcn/ui/button"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Alert, AlertDescription } from "@/shared/shadcn/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Separator } from "@/shared/shadcn/ui/separator"
import {
    MonitorIcon,
    SmartphoneIcon,
    LogOutIcon,
    KeyIcon,
    ShieldIcon,
    ActivityIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    LoaderCircleIcon,
    EyeIcon,
    EyeOffIcon,
} from "lucide-react"
import { itemAnim, containerAnim } from "../settings.animations"
import { useChangePassword } from "@/entities/user/api/hooks"
import type { TabDef } from "../settings.types"

const passwordSection = { title: "Пароль", icon: KeyIcon }
const twoFASection = {
    title: "Двофакторна аутентифікація",
    icon: ShieldIcon,
    description: "Додатковий рівень захисту для вашого акаунту",
}
const sessionsSection = {
    title: "Активні сесії",
    icon: ActivityIcon,
    description: "Пристрої, що мають доступ до вашого акаунту",
}

// Static placeholder sessions – real session API can be added later
const sessions = [
    { device: "MacBook Pro", icon: MonitorIcon, location: "Київ, Україна", current: true },
    { device: "iPhone 15", icon: SmartphoneIcon, location: "Київ, Україна", current: false },
]

function PasswordInput({
    value,
    onChange,
    placeholder,
    id,
}: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    id?: string
}) {
    const [show, setShow] = useState(false)
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
            >
                {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SecurityTab(_: { tab: TabDef }) {
    const changePassword = useChangePassword()

    const [currentPass, setCurrentPass] = useState("")
    const [newPass, setNewPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [clientError, setClientError] = useState<string | null>(null)

    const handleChangePassword = () => {
        setClientError(null)
        changePassword.reset()

        if (!currentPass || !newPass || !confirmPass) {
            setClientError("Заповніть усі поля паролю.")
            return
        }
        if (newPass.length < 8) {
            setClientError("Новий пароль має бути не менше 8 символів.")
            return
        }
        if (newPass !== confirmPass) {
            setClientError("Паролі не збігаються.")
            return
        }

        changePassword.mutate(
            {
                currentPassword: currentPass,
                password: newPass,
                password_confirmation: confirmPass,
            },
            {
                onSuccess: () => {
                    setCurrentPass("")
                    setNewPass("")
                    setConfirmPass("")
                },
            },
        )
    }

    const isLoading = changePassword.isPending
    const isSuccess = changePassword.isSuccess
    const isError = changePassword.isError
    const serverError = isError
        ? (changePassword.error as any)?.body?.message ?? "Не вдалося змінити пароль."
        : null
    const displayError = clientError ?? serverError

    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            {/* Password */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <passwordSection.icon className="size-5 text-primary" />
                            {passwordSection.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="current_pass" className="text-sm font-medium mb-1.5 block">
                                Поточний пароль
                            </label>
                            <PasswordInput
                                id="current_pass"
                                value={currentPass}
                                onChange={setCurrentPass}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="new_pass" className="text-sm font-medium mb-1.5 block">
                                Новий пароль
                            </label>
                            <PasswordInput
                                id="new_pass"
                                value={newPass}
                                onChange={setNewPass}
                                placeholder="Мінімум 8 символів"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm_pass" className="text-sm font-medium mb-1.5 block">
                                Підтвердження пароля
                            </label>
                            <PasswordInput
                                id="confirm_pass"
                                value={confirmPass}
                                onChange={setConfirmPass}
                                placeholder="Повторіть новий пароль"
                            />
                        </div>

                        {/* Status messages */}
                        {isSuccess && (
                            <Alert variant="default" className="border-green-500/30 bg-green-500/5">
                                <CheckCircle2Icon className="size-4 text-green-500" />
                                <AlertDescription className="text-green-600">
                                    Пароль успішно змінено!
                                </AlertDescription>
                            </Alert>
                        )}
                        {displayError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="size-4" />
                                <AlertDescription>{displayError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end">
                            <Button onClick={handleChangePassword} disabled={isLoading}>
                                {isLoading && <LoaderCircleIcon className="size-4 mr-2 animate-spin" />}
                                Змінити пароль
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2FA */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <twoFASection.icon className="size-5 text-primary" />
                            {twoFASection.title}
                        </CardTitle>
                        {twoFASection.description && (
                            <CardDescription>{twoFASection.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div>
                                <p className="text-sm font-medium">Статус: вимкнено</p>
                                <p className="text-xs text-muted-foreground">
                                    Рекомендуємо увімкнути для захисту
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Налаштувати
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sessions */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <sessionsSection.icon className="size-5 text-primary" />
                            {sessionsSection.title}
                        </CardTitle>
                        {sessionsSection.description && (
                            <CardDescription>{sessionsSection.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {sessions.map((s, idx) => (
                            <div key={idx}>
                                {idx > 0 && <Separator className="mb-3" />}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <s.icon className="size-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                {s.device}
                                                {s.current && (
                                                    <Badge variant="secondary" className="text-[9px]">
                                                        Поточна
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{s.location}</p>
                                        </div>
                                    </div>
                                    {!s.current && (
                                        <Button variant="ghost" size="sm">
                                            <LogOutIcon className="size-3.5 mr-1" /> Завершити
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
