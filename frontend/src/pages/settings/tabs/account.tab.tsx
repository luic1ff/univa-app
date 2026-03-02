import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/shared/shadcn/ui/input"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Alert, AlertDescription } from "@/shared/shadcn/ui/alert"
import {
    CameraIcon,
    UserIcon,
    GraduationCapIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    LoaderCircleIcon,
} from "lucide-react"
import { itemAnim, containerAnim } from "../settings.animations"
import { useAuthUser } from "@/entities/user/model/useAuthUser"
import { useUpdateProfile, useUploadAvatar } from "@/entities/user/api/hooks"
import type { TabDef } from "../settings.types"

interface FieldDef {
    id: string
    label: string
    placeholder: string
    type?: string
    fullWidth?: boolean
}

const profileFields: FieldDef[] = [
    { id: "firstName", label: "Ім'я", placeholder: "Іван" },
    { id: "lastName", label: "Прізвище", placeholder: "Петренко" },
    { id: "username", label: "Нікнейм", placeholder: "@nickname" },
    { id: "email", label: "Email", placeholder: "ivan@example.com", type: "email", fullWidth: true },
]

const educationFields: FieldDef[] = [
    { id: "university", label: "Університет", placeholder: "КПІ", fullWidth: true },
    { id: "faculty", label: "Факультет", placeholder: "ФІОТ" },
    { id: "year", label: "Рік навчання", placeholder: "3" },
    { id: "group", label: "Група", placeholder: "ІО-31" },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AccountTab(_: { tab: TabDef }) {
    const user = useAuthUser()
    const updateProfile = useUpdateProfile()
    const uploadAvatar = useUploadAvatar()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // derive initials for avatar fallback
    const initials = [user?.firstName?.[0], user?.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ")

    // form state initialized from current user
    const [form, setForm] = useState<Record<string, string>>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
    })

    // Keep form in sync whenever user data arrives or changes
    useEffect(() => {
        if (!user) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            username: user.username ?? "",
            email: user.email ?? "",
        })
    }, [user])

    const update = (id: string, value: string) => setForm(p => ({ ...p, [id]: value }))

    const handleSave = () => {
        updateProfile.mutate({
            firstName: form.firstName,
            lastName: form.lastName || undefined,
            username: form.username,
        })
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        uploadAvatar.mutate(file)
        // Reset so same file can be re-selected
        e.target.value = ""
    }

    const isLoading = updateProfile.isPending
    const isSuccess = updateProfile.isSuccess
    const isError = updateProfile.isError
    const errorMsg = isError
        ? ((updateProfile.error as any)?.body?.message ?? "Не вдалося зберегти зміни.")
        : null

    const isAvatarUploading = uploadAvatar.isPending
    const avatarError = uploadAvatar.isError
        ? ((uploadAvatar.error as any)?.body?.message ?? "Не вдалося завантажити аватар.")
        : null

    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            {/* Avatar */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardContent className="flex items-center gap-5">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <div className="relative">
                            <Avatar className="size-20">
                                <AvatarImage src={user?.avatarPath ?? ""} alt={displayName} />
                                <AvatarFallback className="text-xl">
                                    {isAvatarUploading
                                        ? <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
                                        : initials
                                    }
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={handleAvatarClick}
                                disabled={isAvatarUploading}
                                className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                            >
                                {isAvatarUploading
                                    ? <LoaderCircleIcon className="size-3.5 animate-spin" />
                                    : <CameraIcon className="size-3.5" />
                                }
                            </button>
                        </div>
                        <div>
                            <p className="text-sm font-medium">{displayName || "…"}</p>
                            {user?.username && (
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP до 2MB</p>
                            {avatarError && (
                                <p className="text-xs text-destructive mt-1">{avatarError}</p>
                            )}
                            {uploadAvatar.isSuccess && (
                                <p className="text-xs text-green-600 mt-1">Аватар оновлено!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Profile fields */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserIcon className="size-5 text-primary" />
                            Особисті дані
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {profileFields.map(f => (
                            <div key={f.id} className={f.fullWidth ? "col-span-2" : ""}>
                                <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                                <Input
                                    type={f.type ?? "text"}
                                    placeholder={f.placeholder}
                                    value={form[f.id] ?? ""}
                                    onChange={e => update(f.id, e.target.value)}
                                    readOnly={f.id === "email"}
                                    disabled={f.id === "email"}
                                    className={f.id === "email" ? "opacity-60" : ""}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Education fields (UI-only placeholder) */}
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCapIcon className="size-5 text-primary" />
                            Освіта
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {educationFields.map(f => (
                            <div key={f.id} className={f.fullWidth ? "col-span-2" : ""}>
                                <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                                <Input
                                    type="text"
                                    placeholder={f.placeholder}
                                    disabled
                                    className="opacity-60"
                                />
                            </div>
                        ))}
                        <p className="col-span-2 text-xs text-muted-foreground">
                            Освітні дані будуть доступні для редагування у наступних версіях.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Status messages */}
            {isSuccess && (
                <Alert variant="default" className="border-green-500/30 bg-green-500/5">
                    <CheckCircle2Icon className="size-4 text-green-500" />
                    <AlertDescription className="text-green-600">Профіль успішно оновлено!</AlertDescription>
                </Alert>
            )}
            {isError && (
                <Alert variant="destructive">
                    <AlertCircleIcon className="size-4" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
            )}

            {/* Save button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && <LoaderCircleIcon className="size-4 mr-2 animate-spin" />}
                    Зберегти зміни
                </Button>
            </div>
        </motion.div>
    )
}
