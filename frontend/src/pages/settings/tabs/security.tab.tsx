import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/shared/shadcn/ui/input"
import { Button } from "@/shared/shadcn/ui/button"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Separator } from "@/shared/shadcn/ui/separator"
import { MonitorIcon, SmartphoneIcon, LogOutIcon, KeyIcon, ShieldIcon, ActivityIcon } from "lucide-react"
import { itemAnim, containerAnim } from "../settings.animations"

const passwordSection = { title: "Пароль", icon: KeyIcon }
const twoFASection = { title: "Двофакторна аутентифікація", icon: ShieldIcon, description: "Додатковий рівень захисту для вашого акаунту" }
const sessionsSection = { title: "Активні сесії", icon: ActivityIcon, description: "Пристрої, що мають доступ до вашого акаунту" }

const sessions = [
    { device: "MacBook Pro", icon: MonitorIcon, location: "Київ, Україна", current: true },
    { device: "iPhone 15", icon: SmartphoneIcon, location: "Київ, Україна", current: false },
]

export function SecurityTab() {
    const [currentPass, setCurrentPass] = useState("")
    const [newPass, setNewPass] = useState("")

    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            {/* Password */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {passwordSection.icon && <passwordSection.icon className="size-5 text-primary" />}
                            {passwordSection.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Поточний пароль</label>
                            <Input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Новий пароль</label>
                            <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                        </div>
                        <div className="flex justify-end"><Button>Змінити пароль</Button></div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2FA */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {twoFASection.icon && <twoFASection.icon className="size-5 text-primary" />}
                            {twoFASection.title}
                        </CardTitle>
                        {twoFASection.description && <CardDescription>{twoFASection.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div>
                                <p className="text-sm font-medium">Статус: вимкнено</p>
                                <p className="text-xs text-muted-foreground">Рекомендуємо увімкнути для захисту</p>
                            </div>
                            <Button variant="outline" size="sm">Налаштувати</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Sessions */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{sessionsSection.title}</CardTitle>
                        {sessionsSection.description && <CardDescription>{sessionsSection.description}</CardDescription>}
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
                                                {s.current && <Badge variant="secondary" className="text-[9px]">Поточна</Badge>}
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
