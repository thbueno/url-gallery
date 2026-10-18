/**
 * PROTOTYPE (throwaway) — in-memory edit overlay for Variant A.
 *
 * Nothing here touches Dexie, chrome.storage or the real stores (`useGalleryStore`,
 * `useTagSettingsStore`): they are only READ (through `useSites()`). Edits live in a module-level
 * Zustand store, kept as small overrides on top of the source sites so a reload of the real data
 * never loses them. Reloading the page resets everything, as intended.
 *
 * Behaviour mirrors the real gallery: removing a site's last tag turns it into "Uncategorized",
 * adding a tag drops "Uncategorized", and pinned tags (tag-level, not site-level) feed the
 * top navbar.
 */
import { useMemo } from "react"
import { create } from "zustand"

import type { SavedSite } from "@/lib/store"

import type { SiteStats, TagInfo } from "./types"

export const UNCATEGORIZED = "Uncategorized"

/** Stable identity for a site across edits (fixtures have no id, so fall back to the URL). */
export function siteKey(site: Pick<SavedSite, "id" | "url">): string {
  return site.id !== undefined ? `id:${site.id}` : `url:${site.url}`
}

interface EditStore {
  tagEdits: Record<string, string[]>
  pinEdits: Record<string, boolean>
  deleted: Record<string, true>
  /** null = not touched yet, follow the seed (real pinned tags or the demo fallback). */
  pinnedTags: string[] | null
  selectMode: boolean
  selected: Record<string, true>
}

export const useEditStore = create<EditStore>(() => ({
  tagEdits: {},
  pinEdits: {},
  deleted: {},
  pinnedTags: null,
  selectMode: false,
  selected: {},
}))

const set = useEditStore.setState

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

/** Case-insensitive match against known tags so "design" reuses "Design". */
function canonical(name: string, known: string[]): string {
  const lower = name.toLowerCase()
  return known.find((t) => t.toLowerCase() === lower) ?? name
}

function withTag(tags: string[], tag: string): string[] {
  if (tags.includes(tag)) return tags
  return [...tags.filter((t) => t !== UNCATEGORIZED), tag]
}

function withoutTag(tags: string[], tag: string): string[] {
  const next = tags.filter((t) => t !== tag)
  return next.length === 0 ? [UNCATEGORIZED] : next
}

export interface EditActions {
  /** Toggle one tag on one site. */
  toggleTag: (key: string, tag: string) => void
  /** Add a (possibly new) tag to many sites. */
  addTagTo: (keys: string[], tag: string) => void
  removeTagFrom: (keys: string[], tag: string) => void
  togglePinTag: (tag: string) => void
  setPinned: (keys: string[], pinned: boolean) => void
  deleteSites: (keys: string[]) => void
  enterSelect: () => void
  exitSelect: () => void
  toggleSelected: (key: string) => void
  setSelected: (keys: string[]) => void
  clearSelected: () => void
}

export interface EditableData {
  sites: SavedSite[]
  tags: TagInfo[]
  stats: SiteStats
  pinnedTags: string[]
  selectMode: boolean
  selected: ReadonlySet<string>
  /** Maps an edited (cloned) site back to the original object, for identity-keyed lookups. */
  original: (site: SavedSite) => SavedSite
  actions: EditActions
}

/** Normalises a user-typed tag name (trim, collapse spaces); "" means invalid. */
export function normalizeTagName(raw: string, known: string[]): string {
  const name = cleanName(raw)
  if (!name || name.toLowerCase() === UNCATEGORIZED.toLowerCase()) return ""
  return canonical(name, known)
}

function makeActions(): EditActions {
  // Source tags are resolved lazily from the sites registered by `useEditableSites`.
  const base = () => baseTags

  return {
    toggleTag: (key, tag) =>
      set((s) => {
        const cur = s.tagEdits[key] ?? base()[key] ?? []
        const next = cur.includes(tag) ? withoutTag(cur, tag) : withTag(cur, tag)
        return { tagEdits: { ...s.tagEdits, [key]: next } }
      }),
    addTagTo: (keys, tag) =>
      set((s) => {
        const tagEdits = { ...s.tagEdits }
        for (const k of keys) tagEdits[k] = withTag(s.tagEdits[k] ?? base()[k] ?? [], tag)
        return { tagEdits }
      }),
    removeTagFrom: (keys, tag) =>
      set((s) => {
        const tagEdits = { ...s.tagEdits }
        for (const k of keys) tagEdits[k] = withoutTag(s.tagEdits[k] ?? base()[k] ?? [], tag)
        return { tagEdits }
      }),
    togglePinTag: (tag) =>
      set((s) => {
        const cur = s.pinnedTags ?? seedPinned
        return { pinnedTags: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag] }
      }),
    setPinned: (keys, pinned) =>
      set((s) => {
        const pinEdits = { ...s.pinEdits }
        for (const k of keys) pinEdits[k] = pinned
        return { pinEdits }
      }),
    deleteSites: (keys) =>
      set((s) => {
        const deleted = { ...s.deleted }
        const selected = { ...s.selected }
        for (const k of keys) {
          deleted[k] = true
          delete selected[k]
        }
        return { deleted, selected }
      }),
    enterSelect: () => set({ selectMode: true }),
    exitSelect: () => set({ selectMode: false, selected: {} }),
    toggleSelected: (key) =>
      set((s) => {
        const selected = { ...s.selected }
        if (selected[key]) delete selected[key]
        else selected[key] = true
        return { selected }
      }),
    setSelected: (keys) =>
      set({ selected: Object.fromEntries(keys.map((k) => [k, true as const])) }),
    clearSelected: () => set({ selected: {} }),
  }
}

// Latest source data, registered by `useEditableSites` so the (stable) actions can read it.
let baseTags: Record<string, string[]> = {}
let seedPinned: string[] = []

const ACTIONS: EditActions = makeActions()

/**
 * Layers the in-memory edits over the real/fixture sites. `sites` keeps the source order; callers
 * sort. `tags` keeps the source tag order, then appends brand-new tags by count.
 */
export function useEditableSites(source: {
  sites: SavedSite[]
  tags: TagInfo[]
}): EditableData {
  const tagEdits = useEditStore((s) => s.tagEdits)
  const pinEdits = useEditStore((s) => s.pinEdits)
  const deleted = useEditStore((s) => s.deleted)
  const pinnedEdit = useEditStore((s) => s.pinnedTags)
  const selectMode = useEditStore((s) => s.selectMode)
  const selectedRec = useEditStore((s) => s.selected)

  const seeded = useMemo(
    () => source.tags.filter((t) => t.pinned).map((t) => t.name),
    [source.tags]
  )
  const pinnedTags = pinnedEdit ?? seeded

  return useMemo(() => {
    // Register source data for the module-level actions.
    baseTags = Object.fromEntries(source.sites.map((s) => [siteKey(s), s.tags]))
    seedPinned = seeded

    const originals = new Map<SavedSite, SavedSite>()
    const sites: SavedSite[] = []
    for (const s of source.sites) {
      const key = siteKey(s)
      if (deleted[key]) continue
      const tags = tagEdits[key] ?? s.tags
      const pinned = pinEdits[key] ?? s.pinned
      const edited = tags === s.tags && pinned === s.pinned ? s : { ...s, tags, pinned }
      originals.set(edited, s)
      sites.push(edited)
    }

    const counts = new Map<string, number>()
    for (const s of sites) for (const t of s.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    const pinnedSet = new Set(pinnedTags)
    const base = source.tags.filter(
      (t) => t.name !== UNCATEGORIZED || (counts.get(t.name) ?? 0) > 0
    )
    const baseNames = new Set(base.map((t) => t.name))
    const added = Array.from(counts)
      .filter(([name]) => !baseNames.has(name))
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
    const tags: TagInfo[] = [...base.map((t) => t.name), ...added].map((name) => ({
      name,
      count: counts.get(name) ?? 0,
      pinned: pinnedSet.has(name),
    }))

    const now = Date.now()
    const stats: SiteStats = {
      totalSites: sites.length,
      totalTags: tags.filter((t) => t.count > 0).length,
      totalOpens: sites.reduce((n, s) => n + s.openCount, 0),
      savedThisWeek: sites.filter((s) => now - s.savedAt < 7 * 86_400_000).length,
      maxOpens: sites.reduce((n, s) => Math.max(n, s.openCount), 0),
    }

    const selected = new Set(Object.keys(selectedRec).filter((k) => !deleted[k]))
    return {
      sites,
      tags,
      stats,
      pinnedTags,
      selectMode,
      selected,
      original: (site: SavedSite) => originals.get(site) ?? site,
      actions: ACTIONS,
    }
  }, [
    source.sites,
    source.tags,
    seeded,
    tagEdits,
    pinEdits,
    deleted,
    pinnedTags,
    selectMode,
    selectedRec,
  ])
}
