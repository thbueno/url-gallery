import type { SavedSite } from "@/lib/store"

export const MAX_PINNED_STRIP = 4

/**
 * Splits sites into the pinned strip and the grid below it. The strip holds the first
 * MAX_PINNED_STRIP pinned sites, and only while no tag filter or search is active; otherwise
 * everything stays in the grid. Order is preserved.
 */
export function splitPinned(
  sites: SavedSite[],
  filtering: boolean
): { strip: SavedSite[]; rest: SavedSite[] } {
  if (filtering) return { strip: [], rest: sites }
  const strip = sites.filter((s) => s.pinned).slice(0, MAX_PINNED_STRIP)
  const inStrip = new Set(strip)
  return { strip, rest: sites.filter((s) => !inStrip.has(s)) }
}
