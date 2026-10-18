import { useCallback, useEffect, useMemo } from "react"

import { parseMessage } from "@/lib/messages"
import type { SavedSite } from "@/lib/store"
import { useGalleryStore } from "@/store/galleryStore"
import { useTagSettingsStore, withEffectiveOrder } from "@/store/tagSettingsStore"

import { FIXTURE_SITES } from "./fixtures"
import type { SiteStats, TagInfo } from "./types"

const WEEK = 7 * 86_400_000

function sortSites(sites: SavedSite[]): SavedSite[] {
  return [...sites].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.savedAt - a.savedAt
  })
}

function countTags(sites: SavedSite[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const s of sites) for (const t of s.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

export interface SitesData {
  sites: SavedSite[]
  tags: TagInfo[]
  stats: SiteStats
  loading: boolean
  isDemo: boolean
}

/**
 * Real sites/tags from the gallery stores (unfiltered: this prototype never sets the store's
 * search/tag filters). Falls back to fixtures when the store is empty.
 */
export function useSites(): SitesData {
  const storeSites = useGalleryStore((s) => s.sites)
  const storeTags = useGalleryStore((s) => s.tags)
  const isLoading = useGalleryStore((s) => s.isLoading)
  const load = useGalleryStore((s) => s.load)
  const pinnedTags = useTagSettingsStore((s) => s.pinnedTags)
  const tagOrder = useTagSettingsStore((s) => s.tagOrder)
  const hydrate = useTagSettingsStore((s) => s.hydrate)

  const reload = useCallback(() => {
    void load()
  }, [load])

  useEffect(() => {
    reload()
    // chrome.storage is only present in the extension; the prototype must not crash without it.
    Promise.resolve()
      .then(() => hydrate())
      .catch(() => {})
  }, [reload, hydrate])

  useEffect(() => {
    const channel = new BroadcastChannel("url-gallery")
    channel.onmessage = (event) => {
      try {
        if (parseMessage(event.data).type === "SITE_SAVED") reload()
      } catch {
        // not a message this tab cares about
      }
    }
    return () => channel.close()
  }, [reload])

  const isDemo = !isLoading && storeSites.length === 0

  return useMemo(() => {
    const sites = sortSites(isDemo ? FIXTURE_SITES : storeSites)
    const counted = isDemo || storeTags.length === 0 ? countTags(sites) : storeTags
    const pinnedSet = new Set(isDemo ? ["Dev Tools", "Design"] : pinnedTags)
    const order = withEffectiveOrder(
      tagOrder,
      counted.map((t) => t.name)
    )
    const byName = new Map(counted.map((t) => [t.name, t.count]))
    const tags: TagInfo[] = order
      .filter((name) => byName.has(name))
      .map((name) => ({ name, count: byName.get(name) ?? 0, pinned: pinnedSet.has(name) }))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    const now = Date.now()
    const stats: SiteStats = {
      totalSites: sites.length,
      totalTags: tags.length,
      totalOpens: sites.reduce((n, s) => n + s.openCount, 0),
      savedThisWeek: sites.filter((s) => now - s.savedAt < WEEK).length,
      maxOpens: sites.reduce((n, s) => Math.max(n, s.openCount), 0),
    }
    return { sites, tags, stats, loading: isLoading && storeSites.length === 0, isDemo }
  }, [isDemo, storeSites, storeTags, isLoading, pinnedTags, tagOrder])
}
