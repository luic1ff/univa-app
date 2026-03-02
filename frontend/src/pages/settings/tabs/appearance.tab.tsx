import { useEffect } from "react"
import { SunIcon, GlobeIcon, MonitorIcon } from "lucide-react"
import { TabShell, DynamicSettingsCard, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/entities/settings/hooks/use-settings-draft"
import type { TabDef } from "../settings.types"

export function AppearanceTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    useEffect(() => { if (data) seed(data) }, [data])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    const themeSettings = data.filter(s => s.key === "appearance.theme")
    const langSettings = data.filter(s => s.key === "appearance.language")
    const ifaceSettings = data.filter(s => !["appearance.theme", "appearance.language"].includes(s.key))

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            {themeSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Тема"
                    icon={SunIcon}
                    settings={themeSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
            {langSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Мова інтерфейсу"
                    icon={GlobeIcon}
                    settings={langSettings}
                    draft={draft}
                    onChange={set}
                    enumColumns={3}
                />
            )}
            {ifaceSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Інтерфейс"
                    icon={MonitorIcon}
                    settings={ifaceSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
        </TabShell>
    )
}
