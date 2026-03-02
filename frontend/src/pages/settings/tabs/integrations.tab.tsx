import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/shared/shadcn/ui/button"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Separator } from "@/shared/shadcn/ui/separator"
import { UnplugIcon } from "lucide-react"
import { itemAnim, containerAnim } from "../settings.animations"
import type { TabDef } from "../settings.types"

const defaultIntegrations = [
    { name: "Google Calendar", icon: "📅", description: "Синхронізація подій та розкладу", connected: false, status: "" },
    { name: "Telegram", icon: "✈️", description: "Сповіщення через Telegram-бот", connected: false, status: "" },
    { name: "Notion", icon: "📝", description: "Імпорт нотаток та задач", connected: false, status: "" },
]

export function IntegrationsTab({ tab: _tab }: { tab: TabDef }) {
    const [items, setItems] = useState(defaultIntegrations)

    const toggle = (name: string) =>
        setItems(prev => prev.map(i => i.name === name ? { ...i, connected: !i.connected, status: i.connected ? "" : "Підключено" } : i))

    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Підключені сервіси</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {items.map((item, idx) => (
                            <div key={item.name}>
                                {idx > 0 && <Separator className="mb-3" />}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                {item.name}
                                                {item.connected && <Badge variant="secondary" className="text-[9px]">{item.status}</Badge>}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                    {item.connected ? (
                                        <Button variant="ghost" size="sm" onClick={() => toggle(item.name)}>
                                            <UnplugIcon className="size-3.5 mr-1" /> Відключити
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => toggle(item.name)}>Підключити</Button>
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
