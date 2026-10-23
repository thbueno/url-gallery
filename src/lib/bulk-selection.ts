import type { SavedSite } from "@/lib/store"

/** Ids from `anchorId` to `targetId` inclusive, in `orderedIds` order. Falls back to just the target. */
export function rangeIds(
  orderedIds: number[],
  anchorId: number | null,
  targetId: number
): number[] {
  const to = orderedIds.indexOf(targetId)
  const from = anchorId === null ? -1 : orderedIds.indexOf(anchorId)
  if (to === -1) return []
  if (from === -1) return [targetId]
  const [lo, hi] = from <= to ? [from, to] : [to, from]
  return orderedIds.slice(lo, hi + 1)
}

export interface TagCount {
  name: string
  count: number
}

/** Tags present on the given sites with how many of them carry each, most common first. */
export function tagCountsFor(sites: SavedSite[], exclude: string): TagCount[] {
  const counts = new Map<string, number>()
  for (const site of sites) {
    for (const tag of site.tags) {
      if (tag === exclude) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  )
}

/** True when every site is pinned (so the bulk action should be "Unpin"). */
export function allPinned(sites: SavedSite[]): boolean {
  return sites.length > 0 && sites.every((s) => s.pinned)
}
