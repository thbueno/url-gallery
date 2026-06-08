import Dexie, { type Table } from "dexie"

export interface SavedSite {
  id?: number
  url: string
  title: string
  favicon: string | null
  thumb: Blob | null
  category: string
  savedAt: number
  openCount: number
  pinned: boolean
}

class SavedSiteDatabase extends Dexie {
  savedSites!: Table<SavedSite, number>

  constructor() {
    super("SavedSiteDatabase")
    this.version(1).stores({
      savedSites: "++id, url, category, pinned, openCount, savedAt",
    })
  }
}

const db = new SavedSiteDatabase()

class SavedSiteStore {
  async add(site: Omit<SavedSite, "id" | "savedAt" | "openCount" | "pinned">): Promise<SavedSite> {
    const record: Omit<SavedSite, "id"> = {
      ...site,
      savedAt: Date.now(),
      openCount: 0,
      pinned: false,
    }
    const id = await db.savedSites.add(record as SavedSite)
    const created = await db.savedSites.get(id)
    if (created === undefined) {
      throw new Error(`Failed to retrieve newly added SavedSite with id ${id}`)
    }
    return created
  }

  async getAll(): Promise<SavedSite[]> {
    return db.savedSites.toArray()
  }

  async getById(id: number): Promise<SavedSite | undefined> {
    return db.savedSites.get(id)
  }

  async update(id: number, patch: Partial<SavedSite>): Promise<void> {
    await db.savedSites.update(id, patch)
  }

  async delete(id: number): Promise<void> {
    await db.savedSites.delete(id)
  }

  async search(query: string): Promise<SavedSite[]> {
    const lower = query.toLowerCase()
    return db.savedSites
      .filter(
        (site) =>
          site.title.toLowerCase().includes(lower) ||
          site.url.toLowerCase().includes(lower) ||
          site.category.toLowerCase().includes(lower)
      )
      .toArray()
  }

  async incrementOpenCount(id: number): Promise<void> {
    await db.savedSites
      .where(":id")
      .equals(id)
      .modify((site) => {
        site.openCount++
      })
  }

  async setPinned(id: number, pinned: boolean): Promise<void> {
    await db.savedSites.update(id, { pinned })
  }
}

export const savedSiteStore = new SavedSiteStore()
