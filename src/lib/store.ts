import Dexie, { type Table } from "dexie"

export interface SavedSite {
  id?: number
  url: string
  title: string
  favicon: string | null
  thumb: Blob | null
  tags: string[]
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
    this.version(2)
      .stores({
        savedSites: "++id, url, *tags, pinned, openCount, savedAt",
      })
      .upgrade((tx) =>
        tx
          .table("savedSites")
          .toCollection()
          .modify((site) => {
            // biome-ignore lint/suspicious/noExplicitAny: legacy v1 record has category field
            site.tags = [(site as any).category ?? "Uncategorized"]
            // biome-ignore lint/suspicious/noExplicitAny: remove migrated field
            // biome-ignore lint/performance/noDelete: must remove legacy field from IndexedDB record
            delete (site as any).category
          })
      )
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

  async bulkAdd(
    sites: Omit<SavedSite, "id" | "savedAt" | "openCount" | "pinned">[]
  ): Promise<SavedSite[]> {
    const now = Date.now()
    const records: Omit<SavedSite, "id">[] = sites.map((site) => ({
      ...site,
      savedAt: now,
      openCount: 0,
      pinned: false,
    }))
    const ids = await db.savedSites.bulkAdd(records as SavedSite[], { allKeys: true })
    const results = await db.savedSites.bulkGet(ids)
    return results.filter((r): r is SavedSite => r !== undefined)
  }

  async bulkUpdate(patches: { id: number; patch: Partial<SavedSite> }[]): Promise<void> {
    await db.transaction("rw", db.savedSites, async () => {
      for (const { id, patch } of patches) {
        await db.savedSites.update(id, patch)
      }
    })
  }

  async getAll(): Promise<SavedSite[]> {
    return db.savedSites.toArray()
  }

  async getById(id: number): Promise<SavedSite | undefined> {
    return db.savedSites.get(id)
  }

  async getByUrl(url: string): Promise<SavedSite | undefined> {
    return db.savedSites.where("url").equals(url).first()
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
          site.tags.some((t) => t.toLowerCase().includes(lower))
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

  async renameTag(oldName: string, newName: string): Promise<void> {
    const all = await db.savedSites.toArray()
    for (const site of all) {
      if (site.id !== undefined && site.tags.includes(oldName)) {
        await db.savedSites.update(site.id, {
          tags: site.tags.map((t) => (t === oldName ? newName : t)),
        })
      }
    }
  }

  async deleteTag(name: string): Promise<void> {
    const all = await db.savedSites.toArray()
    for (const site of all) {
      if (site.id !== undefined && site.tags.includes(name)) {
        const next = site.tags.filter((t) => t !== name)
        await db.savedSites.update(site.id, { tags: next.length > 0 ? next : ["Uncategorized"] })
      }
    }
  }
}

export const savedSiteStore = new SavedSiteStore()
