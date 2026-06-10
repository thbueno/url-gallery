import { create } from "zustand"

import { type SavedSite, savedSiteStore } from "@/lib/store"

export interface TagCount {
  name: string
  count: number
}

export type SortOrder = "savedAt" | "openCount"

interface GalleryStore {
  sites: SavedSite[]
  tags: TagCount[]
  resurfaceSites: SavedSite[]
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

const RESURFACE_DAYS = 7
const RESURFACE_MAX = 6

function sortSites(sites: SavedSite[], order: SortOrder): SavedSite[] {
  return [...sites].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (order === "openCount") return b.openCount - a.openCount
    return b.savedAt - a.savedAt
  })
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

async function queryTags(): Promise<TagCount[]> {
  const all = await savedSiteStore.getAll()
  const counts = new Map<string, number>()
  for (const s of all) {
    for (const tag of s.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

async function queryResurface(): Promise<SavedSite[]> {
  const cutoff = Date.now() - RESURFACE_DAYS * 24 * 60 * 60 * 1000
  const all = await savedSiteStore.getAll()
  return all
    .filter((s) => s.openCount === 0 && s.savedAt < cutoff)
    .sort((a, b) => a.savedAt - b.savedAt)
    .slice(0, RESURFACE_MAX)
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  sites: [],
  tags: [],
  resurfaceSites: [],
  searchQuery: "",
  activeTags: [],
  sortOrder: "savedAt",
  isLoading: true,

  async load() {
    set({ isLoading: true })
    const [sites, tags, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryTags(),
      queryResurface(),
    ])
    set({ sites, tags, resurfaceSites, isLoading: false })
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

  async updateSiteTags(id, tags) {
    await savedSiteStore.update(id, { tags })
    const [sites, tagCounts] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags: tagCounts })
  },

  async togglePin(id, pinned) {
    await savedSiteStore.setPinned(id, pinned)
    const [sites, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryResurface(),
    ])
    set({ sites, resurfaceSites })
  },

  async deleteSite(id) {
    await savedSiteStore.delete(id)
    const [sites, tags, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, get().activeTags, get().sortOrder),
      queryTags(),
      queryResurface(),
    ])
    set({ sites, tags, resurfaceSites })
  },

  async renameTag(oldName, newName) {
    await savedSiteStore.renameTag(oldName, newName)
    const activeTags = get().activeTags.map((t) => (t === oldName ? newName : t))
    const [sites, tags] = await Promise.all([
      querySites(get().searchQuery, activeTags, get().sortOrder),
      queryTags(),
    ])
    set({ sites, tags, activeTags })
  },

  async deleteTag(name) {
    await savedSiteStore.deleteTag(name)
    const activeTags = get().activeTags.filter((t) => t !== name)
    const [sites, tags, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, activeTags, get().sortOrder),
      queryTags(),
      queryResurface(),
    ])
    set({ sites, tags, activeTags, resurfaceSites })
  },
}))
