import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
    bulkUpdateSettings,
    getSelectedValue,
    type SettingItem,
} from "@/entities/settings/api/settings.api"
import { fetchUserSettings } from "@/entities/user/api/settings/fetch-user-settings"
import { mapUiSettings } from "@/entities/user/lib/settings/map-ui-settings"
import { applyDomSettings } from "@/entities/user/lib/settings/apply-dom-settings"
import { saveCachedUiSettings } from "@/entities/user/lib/settings/settings-cache"
import { userSettingsStore } from "@/entities/user/model/settings/settings-store"

/**
 * useSettingsDraft
 *
 * Manages an isolated local draft for one settings group tab.
 *
 * Core invariants:
 *
 *   1. The draft is seeded EXACTLY ONCE per component mount — when the first
 *      API response arrives.  Subsequent React Query refetches (background,
 *      refetchOnWindowFocus, etc.) NEVER touch the draft.
 *
 *   2. `original` is a ref (not state) so diffing never triggers re-renders
 *      and is always in sync with the last data we seeded from.
 *
 *   3. On save:
 *        a. Build a diff (only keys that actually changed).
 *        b. Send a single PATCH /settings bulk request.
 *        c. Inline-update the React Query cache with setQueryData — NO
 *           invalidateQueries, so there is NO background refetch that could
 *           race with the local draft.
 *        d. Re-fetch /me/settings and re-apply DOM settings (theme, lang…).
 */
export function useSettingsDraft(groupId: number) {
    const queryClient = useQueryClient()

    // Holds the user's current (possibly unsaved) form values.
    const [draft, setDraft] = useState<Record<string, string>>({})

    // Tracks whether we've seeded the draft at least once from the API.
    // Using a ref so it persists across renders without causing re-renders.
    const hasSeeded = useRef(false)

    // The last known server-side values — used for diffing on save.
    const original = useRef<Record<string, string>>({})

    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Called from useEffect([data]) in every tab.
     *
     * • Always keeps `original` up to date with whatever the server last sent.
     * • Sets `draft` only on the FIRST call (first real data load).
     *   All subsequent calls (background refetches, window-focus refetches…)
     *   are silently ignored for the draft, so the user never sees snap-back.
     */
    function seed(items: SettingItem[]) {
        const values = Object.fromEntries(
            items.map(s => [s.key, getSelectedValue(s)])
        )
        // Always keep the diff-baseline in sync with the server
        original.current = values

        if (!hasSeeded.current) {
            setDraft(values)
            hasSeeded.current = true
        }
    }

    /** Update a single setting in the local draft. */
    function set(key: string, value: string) {
        setDraft(prev => ({ ...prev, [key]: value }))
        setIsDirty(true)
        setError(null)
    }

    /**
     * Persist all changed settings in one HTTP request, then update the cache
     * and re-apply DOM settings without triggering a background refetch.
     */
    async function onSave() {
        const changed = Object.entries(draft).filter(
            ([key, val]) => original.current[key] !== val
        )

        if (changed.length === 0) {
            setIsDirty(false)
            return
        }

        setIsSaving(true)
        setError(null)
        try {
            // Single PATCH for all changed settings
            await bulkUpdateSettings(
                changed.map(([key, value]) => ({ key, value }))
            )

            // Update our diff baseline
            changed.forEach(([key, val]) => { original.current[key] = val })

            // Inline-update the React Query cache so the tab reflects the new
            // values if a future navigation comes back to it — without refetch.
            queryClient.setQueryData<SettingItem[]>(
                ["settings", groupId],
                (old) => {
                    if (!old) return old
                    return old.map(item => {
                        const newVal = original.current[item.key]
                        if (newVal === undefined) return item
                        const match = item.values.find(v => v.value === newVal)
                        if (!match) return item
                        return { ...item, selected_value_id: match.id }
                    })
                }
            )

            setIsDirty(false)

            // Re-fetch /me/settings and push DOM changes (theme, lang, compact…)
            try {
                const fresh = await fetchUserSettings()
                const ui = mapUiSettings(fresh)
                userSettingsStore.setAll({ ui, items: fresh })
                saveCachedUiSettings(ui)
                applyDomSettings(ui)
            } catch {
                // DOM re-apply is best-effort — settings are already saved
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Не вдалось зберегти"
            setError(msg)
        } finally {
            setIsSaving(false)
        }
    }

    return { draft, set, isDirty, isSaving, error, onSave, seed }
}
