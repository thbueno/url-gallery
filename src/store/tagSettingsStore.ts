import { create } from "zustand"

interface TagSettingsStore {
  pinnedTags: string[]
  customTags: string[]
  tagOrder: string[]
  hydrate: () => Promise<void>
  togglePinTag: (tag: string) => Promise<void>
  addCustomTag: (name: string) => Promise<void>
  removeCustomTag: (name: string) => Promise<void>
  renameCustomTag: (oldName: string, newName: string) => Promise<void>
  reorderTags: (newOrder: string[]) => Promise<void>
}

async function persist(
  patch: Partial<Pick<TagSettingsStore, "pinnedTags" | "customTags" | "tagOrder">>
) {
  await chrome.storage.local.set(patch)
}

/** Merges `tagOrder` with any tag names missing from it, appended in stable order. */
export function withEffectiveOrder(tagOrder: string[], allTagNames: string[]): string[] {
  const known = new Set(tagOrder)
  const missing = allTagNames.filter((name) => !known.has(name))
  return [...tagOrder, ...missing]
}

export const useTagSettingsStore = create<TagSettingsStore>((set, get) => ({
  pinnedTags: [],
  customTags: [],
  tagOrder: [],

  async hydrate() {
    const result = await chrome.storage.local.get(["pinnedTags", "customTags", "tagOrder"])
    set({
      pinnedTags: (result.pinnedTags as string[] | undefined) ?? [],
      customTags: (result.customTags as string[] | undefined) ?? [],
      tagOrder: (result.tagOrder as string[] | undefined) ?? [],
    })
  },

  async togglePinTag(tag) {
    const { pinnedTags } = get()
    const next = pinnedTags.includes(tag)
      ? pinnedTags.filter((t) => t !== tag)
      : [...pinnedTags, tag]
    await persist({ pinnedTags: next })
    set({ pinnedTags: next })
  },

  async addCustomTag(name) {
    const { customTags } = get()
    if (customTags.includes(name)) return
    const next = [...customTags, name]
    await persist({ customTags: next })
    set({ customTags: next })
  },

  async removeCustomTag(name) {
    const { customTags, pinnedTags, tagOrder } = get()
    const nextCustom = customTags.filter((t) => t !== name)
    const nextPinned = pinnedTags.filter((t) => t !== name)
    const nextOrder = tagOrder.filter((t) => t !== name)
    await chrome.storage.local.set({
      customTags: nextCustom,
      pinnedTags: nextPinned,
      tagOrder: nextOrder,
    })
    set({ customTags: nextCustom, pinnedTags: nextPinned, tagOrder: nextOrder })
  },

  async renameCustomTag(oldName, newName) {
    const { customTags, pinnedTags, tagOrder } = get()
    const nextCustom = customTags.map((t) => (t === oldName ? newName : t))
    const nextPinned = pinnedTags.map((t) => (t === oldName ? newName : t))
    const nextOrder = tagOrder.map((t) => (t === oldName ? newName : t))
    await chrome.storage.local.set({
      customTags: nextCustom,
      pinnedTags: nextPinned,
      tagOrder: nextOrder,
    })
    set({ customTags: nextCustom, pinnedTags: nextPinned, tagOrder: nextOrder })
  },

  async reorderTags(newOrder) {
    await persist({ tagOrder: newOrder })
    set({ tagOrder: newOrder })
  },
}))
