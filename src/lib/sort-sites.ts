import type { SavedSite } from "@/lib/store"

const SORT_ORDERS = ["savedAt", "openCount"] as const

export type SortOrder = (typeof SORT_ORDERS)[number]

export function isSortOrder(value: unknown): value is SortOrder {
  return SORT_ORDERS.some((order) => order === value)
}

/** Choices offered by the header sort menu. */
export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "savedAt", label: "Recently saved" },
  { value: "openCount", label: "Most opened" },
]

/** Pinned sites first, then the chosen order. Returns a new array. */
export function sortSites(sites: SavedSite[], order: SortOrder): SavedSite[] {
  return [...sites].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (order === "openCount") return b.openCount - a.openCount || b.savedAt - a.savedAt
    return b.savedAt - a.savedAt
  })
}
