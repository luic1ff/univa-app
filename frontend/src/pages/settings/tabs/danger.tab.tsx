import { motion } from "framer-motion"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Trash2Icon } from "lucide-react"
import { itemAnim, containerAnim } from "../settings.animations"
import type { TabDef } from "../settings.types"

const dangerSection = {
    title: "Небезпечна зона",
    icon: Trash2Icon,
    description: "Ці дії є незворотними. Будьте уважні.",
}

const dangerActions = [
    {
        id: "exportData",
        label: "Експортувати мої дані",
        description: "Завантажити архів усіх ваших даних",
        buttonLabel: "Експортувати",
        variant: "outline" as const,
        destructive: false,
        highlight: false,
    },
    {
        id: "deleteAccount",
        label: "Видалити акаунт",
        description: "Назавжди видалити акаунт та всі дані",
        buttonLabel: "Видалити акаунт",
        variant: "destructive" as const,
        destructive: true,
        highlight: true,
    },
]

export function DangerTab({ tab: _tab }: { tab: TabDef }) {
    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            <motion.div variants={itemAnim}>
                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive flex items-center gap-2">
                            {dangerSection.icon && <dangerSection.icon className="size-5" />}
                            {dangerSection.title}
                        </CardTitle>
                        {dangerSection.description && <CardDescription>{dangerSection.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {dangerActions.map((action) => (
                            <div key={action.id}>
                                {action.id === "deleteAccount" && <Separator className="mb-4" />}
                                <div className={[
                                    "flex items-center justify-between p-3 rounded-lg border",
                                    action.highlight ? "border-destructive/30 bg-destructive/5" : "border-destructive/20",
                                ].join(" ")}>
                                    <div>
                                        <p className={`text-sm font-medium ${action.highlight ? "text-destructive" : ""}`}>{action.label}</p>
                                        <p className="text-xs text-muted-foreground">{action.description}</p>
                                    </div>
                                    <Button
                                        variant={action.variant === "destructive" ? "destructive" : "outline"}
                                        size="sm"
                                        className={action.destructive && action.variant !== "destructive" ? "text-destructive hover:text-destructive" : ""}
                                    >
                                        {action.buttonLabel}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
