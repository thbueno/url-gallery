import type { SavedSite } from "@/lib/store"

import { getDomain } from "../../helpers"

export type SortKey = "title" | "domain" | "opens" | "saved"
export type SortDir = "asc" | "desc"
export interface SortState {
  key: SortKey
  dir: SortDir
}

/** Stable identity for a site (store id when present, else its url). */
export function siteKey(site: SavedSite): string {
  return String(site.id ?? site.url)
}

/** First click on a column uses its natural direction. */
export const NATURAL_DIR: Record<SortKey, SortDir> = {
  title: "asc",
  domain: "asc",
  opens: "desc",
  saved: "desc",
}

export function matchesQuery(site: SavedSite, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    site.title.toLowerCase().includes(q) ||
    site.url.toLowerCase().includes(q) ||
    site.tags.some((t) => t.toLowerCase().includes(q))
  )
}

/** `null` keeps the incoming order (pinned first, then newest). */
export function sortSites(sites: SavedSite[], sort: SortState | null): SavedSite[] {
  if (!sort) return sites
  const sign = sort.dir === "asc" ? 1 : -1
  const out = [...sites]
  out.sort((a, b) => {
    switch (sort.key) {
      case "title":
        return sign * a.title.localeCompare(b.title)
      case "domain":
        return sign * getDomain(a.url).localeCompare(getDomain(b.url))
      case "opens":
        return sign * (a.openCount - b.openCount)
      case "saved":
        return sign * (a.savedAt - b.savedAt)
    }
  })
  return out
}

/** Shared look for secondary (bordered, xs shadow) controls. */
export const CONTROL_BUTTON =
  "border border-border bg-[hsl(var(--surface-inner))] text-foreground shadow-[var(--shadow-xs)] transition-[background-color,border-color,transform] duration-150 ease-out hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--surface-hover))] hover:text-foreground active:scale-[0.98]"
