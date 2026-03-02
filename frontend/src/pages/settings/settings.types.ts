import type { LucideIcon } from "lucide-react"

/* ── Tab definition ── */
export interface TabDef {
    id: string
    label: string
    icon: LucideIcon
    description: string
    badge?: string
    group?: string
    /** Backend group ID — undefined for action-only tabs (account, security, etc.) */
    groupId?: number
}

/* ── Integration item (used by integrations tab) ── */
export interface IntegrationItem {
    name: string
    description: string
    icon: string
    connected: boolean
    status: string
}
