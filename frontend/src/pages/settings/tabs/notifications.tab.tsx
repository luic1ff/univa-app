import { useEffect } from "react"
import { MailIcon, BellIcon } from "lucide-react"
import { TabShell, DynamicSettingsCard, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/entities/settings/hooks/use-settings-draft"
import type { TabDef } from "../settings.types"

export function NotificationsTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    useEffect(() => { if (data) seed(data) }, [data])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    const emailSettings = data.filter(s => s.key.includes("email") || s.key.includes("digest"))
    const pushSettings = data.filter(s => !emailSettings.includes(s))

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            {emailSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Email-сповіщення"
                    icon={MailIcon}
                    settings={emailSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
            {pushSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Push та звуки"
                    icon={BellIcon}
                    settings={pushSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
        </TabShell>
    )
}
