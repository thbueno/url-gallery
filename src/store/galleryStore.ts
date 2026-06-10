import { create } from "zustand"

import { type SavedSite, savedSiteStore } from "@/lib/store"

export interface CategoryCount {
  name: string
  count: number
}

export type SortOrder = "savedAt" | "openCount"

interface GalleryStore {
  sites: SavedSite[]
  categories: CategoryCount[]
  resurfaceSites: SavedSite[]
  searchQuery: string
  activeCategory: string | null
  sortOrder: SortOrder
  isLoading: boolean
  load: () => Promise<void>
  setSearchQuery: (query: string) => Promise<void>
  setActiveCategory: (category: string | null) => Promise<void>
  setSortOrder: (order: SortOrder) => Promise<void>
  updateSiteCategory: (id: number, category: string) => Promise<void>
  togglePin: (id: number, pinned: boolean) => Promise<void>
  deleteSite: (id: number) => Promise<void>
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
  category: string | null,
  order: SortOrder
): Promise<SavedSite[]> {
  let results: SavedSite[]
  if (query.trim()) {
    results = await savedSiteStore.search(query.trim())
  } else {
    results = await savedSiteStore.getAll()
  }
  if (category) results = results.filter((s) => s.category === category)
  return sortSites(results, order)
}

async function queryCategories(): Promise<CategoryCount[]> {
  const all = await savedSiteStore.getAll()
  const counts = new Map<string, number>()
  for (const s of all) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1)
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
  categories: [],
  resurfaceSites: [],
  searchQuery: "",
  activeCategory: null,
  sortOrder: "savedAt",
  isLoading: true,

  async load() {
    set({ isLoading: true })
    const [sites, categories, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, get().activeCategory, get().sortOrder),
      queryCategories(),
      queryResurface(),
    ])
    set({ sites, categories, resurfaceSites, isLoading: false })
  },

  async setSearchQuery(query) {
    set({ searchQuery: query, isLoading: true })
    const sites = await querySites(query, get().activeCategory, get().sortOrder)
    set({ sites, isLoading: false })
  },

  async setActiveCategory(category) {
    set({ activeCategory: category, isLoading: true })
    const sites = await querySites(get().searchQuery, category, get().sortOrder)
    set({ sites, isLoading: false })
  },

  async setSortOrder(order) {
    set({ sortOrder: order, isLoading: true })
    const sites = await querySites(get().searchQuery, get().activeCategory, order)
    set({ sites, isLoading: false })
  },

  async updateSiteCategory(id, category) {
    await savedSiteStore.update(id, { category })
    const [sites, categories] = await Promise.all([
      querySites(get().searchQuery, get().activeCategory, get().sortOrder),
      queryCategories(),
    ])
    set({ sites, categories })
  },

  async togglePin(id, pinned) {
    await savedSiteStore.setPinned(id, pinned)
    const [sites, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, get().activeCategory, get().sortOrder),
      queryResurface(),
    ])
    set({ sites, resurfaceSites })
  },

  async deleteSite(id) {
    await savedSiteStore.delete(id)
    const [sites, categories, resurfaceSites] = await Promise.all([
      querySites(get().searchQuery, get().activeCategory, get().sortOrder),
      queryCategories(),
      queryResurface(),
    ])
    set({ sites, categories, resurfaceSites })
  },
}))
