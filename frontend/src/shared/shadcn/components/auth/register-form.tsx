import { cn } from "@/shared/shadcn/lib/utils"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent } from "@/shared/shadcn/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/shared/shadcn/ui/field"
import { Input } from "@/shared/shadcn/ui/input"
import { Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, User, Phone, Globe, Users, Hash, GraduationCap, School, Image as ImageIcon } from "lucide-react"
import React, { useMemo, useState } from "react"
import { AvatarPicker } from "@/shared/ui/components/avatar-picker"

/** ===== Types ===== */

export interface RegisterFormData {
    // Персональні
    last_name: string
    first_name: string
    middle_name: string

    // Акаунт
    username: string
    email: string
    phone: string

    // Навчання (опційно)
    university: string
    faculty: string
    specialty: string
    group: string
    course: string

    // Налаштування (опційно)
    language: "uk" | "en"
    timezone: string

    // Додатково
    referral_code: string
    avatar: File | null

    // Безпека
    password: string
    password_confirmation: string

    // Згоди
    agree_terms: boolean
    marketing_opt_in: boolean
}

type RegisterFieldName = keyof RegisterFormData

interface RegisterFormProps {
    className?: string
    form: RegisterFormData
    onFieldChange: (field: RegisterFieldName, value: RegisterFormData[RegisterFieldName]) => void
    onSubmit: (e: React.FormEvent) => void
    isPending: boolean
    errors?: Record<string, string>
}

type FieldType = "text" | "email" | "password" | "tel" | "file" | "select" | "checkbox"

type FieldDef = {
    section: "Персональні дані" | "Дані акаунта" | "Навчання" | "Безпека" | "Підтвердження"
    name: RegisterFieldName
    label: string
    type: FieldType
    placeholder?: string
    autoComplete?: string
    required?: boolean
    icon?: React.ReactNode
    colSpan?: 1 | 2
    options?: { value: string; label: string }[] // для select
    helper?: string
}

/** ===== Helpers ===== */

function passwordScore(p: string) {
    let score = 0
    if (p.length >= 8) score += 1
    if (p.length >= 12) score += 1
    if (/[A-ZА-ЯЇІЄ]/.test(p)) score += 1
    if (/[a-zа-яїіє]/.test(p)) score += 1
    if (/\d/.test(p)) score += 1
    if (/[^A-Za-zА-Яа-яЇІЄїіє0-9]/.test(p)) score += 1
    return Math.min(score, 5)
}

function scoreLabel(score: number) {
    if (score <= 1) return "Слабкий"
    if (score === 2) return "Нормальний"
    if (score === 3) return "Добрий"
    if (score >= 4) return "Сильний"
    return "Слабкий"
}

/** ===== Fields config ===== */

const FIELDS: FieldDef[] = [
    // Персональні
    {
        section: "Персональні дані",
        name: "last_name",
        label: "Прізвище",
        type: "text",
        placeholder: "Шевченко",
        autoComplete: "family-name",
        required: true,
        icon: <User className="w-4 h-4" />,
        colSpan: 1,
    },
    {
        section: "Персональні дані",
        name: "first_name",
        label: "Ім’я",
        type: "text",
        placeholder: "Тарас",
        autoComplete: "given-name",
        required: true,
        icon: <User className="w-4 h-4" />,
        colSpan: 1,
    },
    {
        section: "Персональні дані",
        name: "middle_name",
        label: "По-батькові",
        type: "text",
        placeholder: "Григорович",
        autoComplete: "additional-name",
        required: false,
        icon: <User className="w-4 h-4" />,
        colSpan: 2,
    },

    // Акаунт
    {
        section: "Дані акаунта",
        name: "username",
        label: "Нік (логін)",
        type: "text",
        placeholder: "univa_user",
        autoComplete: "username",
        required: true,
        icon: <Hash className="w-4 h-4" />,
        colSpan: 1,
        helper: "Лише для входу/профілю (не обов’язково email).",
    },
    {
        section: "Дані акаунта",
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        required: true,
        icon: <Mail className="w-4 h-4" />,
        colSpan: 1,
    },
    {
        section: "Дані акаунта",
        name: "phone",
        label: "Телефон",
        type: "tel",
        placeholder: "+380…",
        autoComplete: "tel",
        required: false,
        icon: <Phone className="w-4 h-4" />,
        colSpan: 2,
        helper: "Опційно — для відновлення доступу/підтвердження.",
    },
    {
        section: "Дані акаунта",
        name: "avatar",
        label: "Аватар",
        type: "file",
        required: false,
        icon: <ImageIcon className="w-4 h-4" />,
        colSpan: 2,
        helper: "PNG/JPG/WebP, бажано до 2–5 МБ.",
    },

    // Навчання
    {
        section: "Навчання",
        name: "university",
        label: "Навчальний заклад",
        type: "text",
        placeholder: "Коледж / Університет",
        required: false,
        icon: <School className="w-4 h-4" />,
        colSpan: 2,
    },
    {
        section: "Навчання",
        name: "faculty",
        label: "Факультет / Відділення",
        type: "text",
        placeholder: "Напр., Економічний",
        required: false,
        icon: <GraduationCap className="w-4 h-4" />,
        colSpan: 1,
    },
    {
        section: "Навчання",
        name: "specialty",
        label: "Спеціальність",
        type: "text",
        placeholder: "Напр., Менеджмент",
        required: false,
        icon: <GraduationCap className="w-4 h-4" />,
        colSpan: 1,
    },
    {
        section: "Навчання",
        name: "group",
        label: "Група",
        type: "text",
        placeholder: "МТ23",
        required: false,
        icon: <Users className="w-4 h-4" />,
        colSpan: 1,
    },
    {
        section: "Навчання",
        name: "course",
        label: "Курс",
        type: "text",
        placeholder: "1–6",
        required: false,
        icon: <Users className="w-4 h-4" />,
        colSpan: 1,
    },

    // Налаштування
    {
        section: "Навчання",
        name: "language",
        label: "Мова",
        type: "select",
        required: false,
        icon: <Globe className="w-4 h-4" />,
        colSpan: 1,
        options: [
            { value: "uk", label: "Українська" },
            { value: "en", label: "English" },
        ],
    },
    {
        section: "Навчання",
        name: "timezone",
        label: "Часовий пояс",
        type: "text",
        required: false,
        icon: <Globe className="w-4 h-4" />,
        colSpan: 1,
        placeholder: "Europe/Zaporozhye",
        helper: "Можна лишити за замовчуванням.",
    },

    // Безпека
    {
        section: "Безпека",
        name: "password",
        label: "Пароль",
        type: "password",
        placeholder: "••••••••",
        autoComplete: "new-password",
        required: true,
        icon: <Lock className="w-4 h-4" />,
        colSpan: 1,
        helper: "8+ символів, краще з цифрами та символами.",
    },
    {
        section: "Безпека",
        name: "password_confirmation",
        label: "Підтвердіть пароль",
        type: "password",
        placeholder: "••••••••",
        autoComplete: "new-password",
        required: true,
        icon: <Lock className="w-4 h-4" />,
        colSpan: 1,
    },

    // Підтвердження
    {
        section: "Підтвердження",
        name: "agree_terms",
        label: "Погоджуюсь з умовами та політикою приватності",
        type: "checkbox",
        required: true,
        colSpan: 2,
    },
    {
        section: "Підтвердження",
        name: "marketing_opt_in",
        label: "Отримувати новини та оновлення (опційно)",
        type: "checkbox",
        required: false,
        colSpan: 2,
    },
]

const SECTIONS: FieldDef["section"][] = [
    "Персональні дані",
    "Дані акаунта",
    "Навчання",
    "Безпека",
    "Підтвердження",
]

/** ===== Component ===== */

export function RegisterForm({
                                 className,
                                 form,
                                 onFieldChange,
                                 onSubmit,
                                 isPending,
                                 errors = {},
                             }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const passScore = useMemo(() => passwordScore(form.password), [form.password])
    const passText = useMemo(() => scoreLabel(passScore), [passScore])

    const sectionFields = useMemo(() => {
        const map = new Map<FieldDef["section"], FieldDef[]>()
        for (const s of SECTIONS) map.set(s, [])
        for (const f of FIELDS) map.get(f.section)!.push(f)
        return map
    }, [])

    const renderField = (f: FieldDef) => {
        const err = errors[String(f.name)]
        const invalid = !!err

        // Checkbox
        if (f.type === "checkbox") {
            const checked = Boolean(form[f.name] as unknown as boolean)

            return (
                <Field
                    key={String(f.name)}
                    data-invalid={invalid || undefined}
                    className={cn(f.colSpan === 2 ? "md:col-span-2" : "")}
                >
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-muted-foreground/30"
                            checked={checked}
                            onChange={(e) => onFieldChange(f.name, e.target.checked as any)}
                            required={!!f.required}
                            aria-invalid={invalid}
                        />
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium leading-snug">{f.label}</span>
                            {err && <FieldError className="text-xs">{err}</FieldError>}
                        </div>
                    </label>
                </Field>
            )
        }

        // File
        if (f.type === "file") {
            const value = (form[f.name] as unknown as File | null) ?? null

            return (
                <Field
                    key={String(f.name)}
                    data-invalid={invalid || undefined}
                    className={cn(f.colSpan === 2 ? "md:col-span-2" : "")}
                >
                    <FieldLabel className="text-sm font-medium">
                        {f.label}
                        {!f.required && " (опційно)"}
                    </FieldLabel>

                    <AvatarPicker
                        value={value}
                        onChange={(file) => onFieldChange(f.name, file as any)}
                        helper={f.helper}
                        error={err}
                        maxSizeMb={5}
                    />
                </Field>
            )
        }

        // Select
        if (f.type === "select") {
            const value = String(form[f.name] ?? "")

            return (
                <Field
                    key={String(f.name)}
                    data-invalid={invalid || undefined}
                    className={cn(f.colSpan === 2 ? "md:col-span-2" : "")}
                >
                    <FieldLabel className="text-sm font-medium">{f.label}{!f.required && " (опційно)"}</FieldLabel>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {f.icon}
                        </div>
                        <select
                            className={cn(
                                "h-11 w-full rounded-md border border-input bg-background px-3 pl-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
                                invalid && "border-destructive focus:ring-destructive/20"
                            )}
                            value={value}
                            onChange={(e) => onFieldChange(f.name, e.target.value as any)}
                            required={!!f.required}
                            aria-invalid={invalid}
                        >
                            {(f.options ?? []).map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {f.helper && <FieldDescription className="text-xs">{f.helper}</FieldDescription>}
                    {err && <FieldError className="text-xs mt-1">{err}</FieldError>}
                </Field>
            )
        }

        // Text / Email / Tel / Password
        const isPassword = f.type === "password"
        const isConfirm = f.name === "password_confirmation"
        const show = isPassword && (isConfirm ? showConfirmPassword : showPassword)

        return (
            <Field
                key={String(f.name)}
                data-invalid={invalid || undefined}
                className={cn(f.colSpan === 2 ? "md:col-span-2" : "")}
            >
                <FieldLabel htmlFor={`reg-${String(f.name)}`} className="text-sm font-medium">
                    {f.label}{!f.required && " (опційно)"}
                </FieldLabel>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {f.icon}
                    </div>

                    <Input
                        id={`reg-${String(f.name)}`}
                        type={isPassword && show ? "text" : f.type}
                        placeholder={f.placeholder}
                        autoComplete={f.autoComplete}
                        value={String(form[f.name] ?? "")}
                        onChange={(e) => onFieldChange(f.name, e.target.value as any)}
                        aria-invalid={invalid}
                        className={cn(
                            "h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                            isPassword ? "pl-10 pr-10" : "pl-10",
                            invalid && "border-destructive focus:ring-destructive/20"
                        )}
                        required={!!f.required}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => (isConfirm ? setShowConfirmPassword((v) => !v) : setShowPassword((v) => !v))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={show ? "Сховати пароль" : "Показати пароль"}
                        >
                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {f.name === "password" && (
                    <FieldDescription className="text-xs">
                        Сила пароля: <span className="font-medium">{passText}</span>
                    </FieldDescription>
                )}

                {f.helper && f.name !== "password" && <FieldDescription className="text-xs">{f.helper}</FieldDescription>}
                {err && <FieldError className="text-xs mt-1">{err}</FieldError>}
            </Field>
        )
    }

    return (
        <div className={cn("flex flex-col gap-6 justify-center items-center w-full", className)}>
            <Card className="overflow-hidden p-0 w-full shadow-xl border-0 bg-gradient-to-br from-background via-background to-muted/20">
                <CardContent className="grid p-0">
                    <form onSubmit={onSubmit} className="p-8 md:p-10">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-3 text-center mb-4">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Створити акаунт
                                </h1>
                                <p className="text-muted-foreground text-balance text-sm">
                                    Приєднуйтесь до Univa
                                </p>
                            </div>

                            {SECTIONS.map((section) => {
                                const fields = sectionFields.get(section) ?? []
                                return (
                                    <div key={section} className="mt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-px flex-1 bg-border/60" />
                                            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground">
                                                {section}
                                            </h2>
                                            <div className="h-px flex-1 bg-border/60" />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {fields.map(renderField)}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Submit */}
                            <div className="mt-5">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Реєструємо…
                    </span>
                                    ) : "Зареєструватись"}
                                </Button>
                            </div>

                            {/* Link to login */}
                            <FieldDescription className="text-center text-sm mt-3">
                                Вже є акаунт?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-primary hover:underline underline-offset-2 transition-colors"
                                >
                                    Увійти
                                </Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

/** ===== Optional: starter initial state =====
 export const registerInitialState: RegisterFormData = {
 last_name: "",
 first_name: "",
 middle_name: "",
 username: "",
 email: "",
 phone: "",
 university: "",
 faculty: "",
 specialty: "",
 group: "",
 course: "",
 language: "uk",
 timezone: "Europe/Zaporozhye",
 referral_code: "",
 avatar: null,
 password: "",
 password_confirmation: "",
 agree_terms: false,
 marketing_opt_in: false,
 }
 */
