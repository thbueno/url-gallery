import { create } from "zustand"

import { type SortOrder, sortSites } from "@/lib/sort-sites"
import { type SavedSite, savedSiteStore } from "@/lib/store"

export interface TagCount {
  name: string
  count: number
}

interface GalleryStore {
  sites: SavedSite[]
  tags: TagCount[]
  /** Every saved site, ignoring search and tag filters. */
  totalSites: number
  searchQuery: string
  activeTags: string[]
  sortOrder: SortOrder
  isLoading: boolean
  load: () => Promise<void>
  setSearchQuery: (query: string) => Promise<void>
  setActiveTags: (tags: string[]) => Promise<void>
  setSortOrder: (order: SortOrder) => Promise<void>
  updateSiteTags: (id: number, tags: string[]) => Promise<void>
  togglePin: (id: number, pinned: boolean) => Promise<void>
  deleteSite: (id: number) => Promise<void>
  renameTag: (oldName: string, newName: string) => Promise<void>
  deleteTag: (name: string) => Promise<void>
}

async function querySites(
  query: string,
  activeTags: string[],
  order: SortOrder
): Promise<SavedSite[]> {
  let results: SavedSite[]
  if (query.trim()) {
    results = await savedSiteStore.search(query.trim())
  } else {
    results = await savedSiteStore.getAll()
  }
  if (activeTags.length > 0) {
    results = results.filter((s) => s.tags.some((t) => activeTags.includes(t)))
  }
  return sortSites(results, order)
}

async function queryTags(): Promise<{ tags: TagCount[]; totalSites: number }> {
  const all = await savedSiteStore.getAll()
  const counts = new Map<string, number>()
  for (const s of all) {
    for (const tag of s.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  const tags = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
  return { tags, totalSites: all.length }
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  sites: [],
  tags: [],
  totalSites: 0,
  searchQuery: "",
  activeTags: [],
  sortOrder: "savedAt",
  isLoading: true,

  async load() {
    set({ isLoading: true })
    const [sites, { tags, totalSites }] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags, totalSites, isLoading: false })
  },

  async setSearchQuery(query) {
    set({ searchQuery: query, isLoading: true })
    const sites = await querySites(query, get().activeTags, get().sortOrder)
    set({ sites, isLoading: false })
  },

  async setActiveTags(tags) {
    set({ activeTags: tags, isLoading: true })
    const sites = await querySites(get().searchQuery, tags, get().sortOrder)
    set({ sites, isLoading: false })
  },

  async setSortOrder(order) {
    set({ sortOrder: order, isLoading: true })
    const sites = await querySites(get().searchQuery, get().activeTags, order)
    set({ sites, isLoading: false })
  },

  async updateSiteTags(id, siteTags) {
    await savedSiteStore.update(id, { tags: siteTags })
    const [sites, { tags, totalSites }] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags, totalSites })
  },

  async togglePin(id, pinned) {
    await savedSiteStore.setPinned(id, pinned)
    const sites = await querySites(get().searchQuery, get().activeTags, get().sortOrder)
    set({ sites })
  },

  async deleteSite(id) {
    await savedSiteStore.delete(id)
    const [sites, { tags, totalSites }] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags, totalSites })
  },

  async renameTag(oldName, newName) {
    await savedSiteStore.renameTag(oldName, newName)
    const activeTags = get().activeTags.map((t) => (t === oldName ? newName : t))
    const [sites, { tags, totalSites }] = await Promise.all([
      querySites(get().searchQuery, activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags, totalSites, activeTags })
  },

  async deleteTag(name) {
    await savedSiteStore.deleteTag(name)
    const activeTags = get().activeTags.filter((t) => t !== name)
    const [sites, { tags, totalSites }] = await Promise.all([
      querySites(get().searchQuery, activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags, totalSites, activeTags })
  },
}))
