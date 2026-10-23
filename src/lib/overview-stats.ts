import type { SavedSite } from "@/lib/store"

const DAY = 86_400_000
/** "This week" means the last 7 days, counted back from now (not the calendar week). */
const WEEK = 7 * DAY
export const LIST_SIZE = 5
export const SHELF_SIZE = 14

export interface TagShelfData {
  tag: string
  /** Every site with this tag, even though `sites` is capped to the shelf size. */
  total: number
  sites: SavedSite[]
}

export interface OverviewStats {
  totalSites: number
  /** Distinct tags in use. */
  totalTags: number
  totalOpens: number
  savedThisWeek: number
  /** Most opened site, or null when nothing has been opened yet. */
  hero: SavedSite | null
  /** Top sites by Open count (never-opened sites are left out). */
  mostOpened: SavedSite[]
  /** Latest saved first. */
  recent: SavedSite[]
  /** One per tag, biggest tag first. */
  shelves: TagShelfData[]
}

const byOpens = (a: SavedSite, b: SavedSite) => b.openCount - a.openCount || b.savedAt - a.savedAt

export function computeOverview(sites: SavedSite[], now = Date.now()): OverviewStats {
  const ranked = [...sites].sort(byOpens)
  const mostOpened = ranked.filter((s) => s.openCount > 0).slice(0, LIST_SIZE)

  const groups = new Map<string, SavedSite[]>()
  for (const s of ranked) {
    for (const tag of s.tags) groups.set(tag, [...(groups.get(tag) ?? []), s])
  }
  const shelves = [...groups.entries()]
    .map(([tag, list]) => ({ tag, total: list.length, sites: list.slice(0, SHELF_SIZE) }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))

  return {
    totalSites: sites.length,
    totalTags: groups.size,
    totalOpens: sites.reduce((n, s) => n + s.openCount, 0),
    savedThisWeek: sites.filter((s) => now - s.savedAt < WEEK).length,
    hero: mostOpened[0] ?? null,
    mostOpened,
    recent: [...sites].sort((a, b) => b.savedAt - a.savedAt).slice(0, LIST_SIZE),
    shelves,
  }
}
