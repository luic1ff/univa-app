import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/shared/shadcn/ui/input"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { CameraIcon, UserIcon, GraduationCapIcon } from "lucide-react"
import { itemAnim, containerAnim } from "../settings.animations"

const profileSection = { title: "Особисті дані", icon: UserIcon }
const educationSection = { title: "Освіта", icon: GraduationCapIcon }
interface FieldDef { id: string; label: string; placeholder: string; type?: string }
const profileFields: FieldDef[] = [
    { id: "first_name", label: "Ім'я", placeholder: "Іван" },
    { id: "last_name", label: "Прізвище", placeholder: "Петренко" },
    { id: "username", label: "Нікнейм", placeholder: "@nickname" },
    { id: "email", label: "Email", placeholder: "ivan@example.com", type: "email" },
]
const educationFields: FieldDef[] = [
    { id: "university", label: "Університет", placeholder: "КПІ" },
    { id: "faculty", label: "Факультет", placeholder: "ФІОТ" },
    { id: "year", label: "Рік навчання", placeholder: "3" },
    { id: "group", label: "Група", placeholder: "ІО-31" },
]

export function AccountTab() {
    const [form, setForm] = useState<Record<string, string>>({})
    const update = (id: string, value: string) => setForm(p => ({ ...p, [id]: value }))

    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            {/* Avatar */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-5">
                        <div className="relative">
                            <Avatar className="size-20">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-xl">OS</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow cursor-pointer">
                                <CameraIcon className="size-3.5" />
                            </button>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Фото профілю</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG до 2MB</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Profile fields */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {profileSection.icon && <profileSection.icon className="size-5 text-primary" />}
                            {profileSection.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {profileFields.map(f => (
                            <div key={f.id} className={f.id === "email" ? "col-span-2" : ""}>
                                <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                                <Input
                                    type={f.type ?? "text"}
                                    placeholder={f.placeholder}
                                    value={form[f.id] ?? ""}
                                    onChange={e => update(f.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Education fields */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {educationSection.icon && <educationSection.icon className="size-5 text-primary" />}
                            {educationSection.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {educationFields.map(f => (
                            <div key={f.id} className={f.id === "university" ? "col-span-2" : ""}>
                                <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                                <Input
                                    type={f.type ?? "text"}
                                    placeholder={f.placeholder}
                                    value={form[f.id] ?? ""}
                                    onChange={e => update(f.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            <div className="flex justify-end"><Button>Зберегти зміни</Button></div>
        </motion.div>
    )
}
