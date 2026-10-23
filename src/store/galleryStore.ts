import { create } from "zustand"

import { loadSortOrder, saveSortOrder } from "@/lib/sort-preference"
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

type Filters = Pick<GalleryStore, "searchQuery" | "activeTags" | "sortOrder">

async function querySites({ searchQuery, activeTags, sortOrder }: Filters): Promise<SavedSite[]> {
  const query = searchQuery.trim()
  let results = query ? await savedSiteStore.search(query) : await savedSiteStore.getAll()
  if (activeTags.length > 0) {
    results = results.filter((s) => s.tags.some((t) => activeTags.includes(t)))
  }
  return sortSites(results, sortOrder)
}

interface TagSummary {
  tags: TagCount[]
  /** Every saved site, ignoring filters. */
  totalSites: number
}

/** Tag counts (most used first) plus the size of the whole library. */
async function queryTagSummary(): Promise<TagSummary> {
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

/** Sites for the given filters together with fresh tag counts. */
async function querySitesAndTags(filters: Filters) {
  const [sites, summary] = await Promise.all([querySites(filters), queryTagSummary()])
  return { sites, ...summary }
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  sites: [],
  tags: [],
  totalSites: 0,
  searchQuery: "",
  activeTags: [],
  sortOrder: loadSortOrder(),
  isLoading: true,

  async load() {
    set({ isLoading: true })
    set({ ...(await querySitesAndTags(get())), isLoading: false })
  },

  async setSearchQuery(searchQuery) {
    set({ searchQuery, isLoading: true })
    set({ sites: await querySites(get()), isLoading: false })
  },

  async setActiveTags(activeTags) {
    set({ activeTags, isLoading: true })
    set({ sites: await querySites(get()), isLoading: false })
  },

  async setSortOrder(sortOrder) {
    saveSortOrder(sortOrder)
    set({ sortOrder, isLoading: true })
    set({ sites: await querySites(get()), isLoading: false })
  },

  async updateSiteTags(id, siteTags) {
    await savedSiteStore.update(id, { tags: siteTags })
    set(await querySitesAndTags(get()))
  },

  async togglePin(id, pinned) {
    await savedSiteStore.setPinned(id, pinned)
    set({ sites: await querySites(get()) })
  },

  async deleteSite(id) {
    await savedSiteStore.delete(id)
    set(await querySitesAndTags(get()))
  },

  async renameTag(oldName, newName) {
    await savedSiteStore.renameTag(oldName, newName)
    const activeTags = get().activeTags.map((t) => (t === oldName ? newName : t))
    set({ ...(await querySitesAndTags({ ...get(), activeTags })), activeTags })
  },

  async deleteTag(name) {
    await savedSiteStore.deleteTag(name)
    const activeTags = get().activeTags.filter((t) => t !== name)
    set({ ...(await querySitesAndTags({ ...get(), activeTags })), activeTags })
  },
}))
