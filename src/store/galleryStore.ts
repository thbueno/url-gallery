import { create } from "zustand"

import { type SavedSite, savedSiteStore } from "@/lib/store"

export interface CategoryCount {
  name: string
  count: number
}

interface GalleryStore {
  sites: SavedSite[]
  categories: CategoryCount[]
  searchQuery: string
  activeCategory: string | null
  isLoading: boolean
  load: () => Promise<void>
  setSearchQuery: (query: string) => Promise<void>
  setActiveCategory: (category: string | null) => Promise<void>
  updateSiteCategory: (id: number, category: string) => Promise<void>
}

async function querySites(query: string, category: string | null): Promise<SavedSite[]> {
  let results: SavedSite[]
  if (query.trim()) {
    results = await savedSiteStore.search(query.trim())
  } else {
    results = await savedSiteStore.getAll()
  }
  return category ? results.filter((s) => s.category === category) : results
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

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  sites: [],
  categories: [],
  searchQuery: "",
  activeCategory: null,
  isLoading: true,

  async load() {
    set({ isLoading: true })
    const [sites, categories] = await Promise.all([
      querySites(get().searchQuery, get().activeCategory),
      queryCategories(),
    ])
    set({ sites, categories, isLoading: false })
  },

  async setSearchQuery(query) {
    set({ searchQuery: query, isLoading: true })
    const sites = await querySites(query, get().activeCategory)
    set({ sites, isLoading: false })
  },

  async setActiveCategory(category) {
    set({ activeCategory: category, isLoading: true })
    const sites = await querySites(get().searchQuery, category)
    set({ sites, isLoading: false })
  },

  async updateSiteCategory(id, category) {
    await savedSiteStore.update(id, { category })
    const [sites, categories] = await Promise.all([
      querySites(get().searchQuery, get().activeCategory),
      queryCategories(),
    ])
    set({ sites, categories })
  },
}))
