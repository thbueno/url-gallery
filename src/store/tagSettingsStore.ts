import { create } from "zustand"

interface TagSettingsStore {
  pinnedTags: string[]
  customTags: string[]
  hydrate: () => Promise<void>
  togglePinTag: (tag: string) => Promise<void>
  addCustomTag: (name: string) => Promise<void>
  removeCustomTag: (name: string) => Promise<void>
  renameCustomTag: (oldName: string, newName: string) => Promise<void>
}

async function persist(patch: Partial<Pick<TagSettingsStore, "pinnedTags" | "customTags">>) {
  await chrome.storage.local.set(patch)
}

export const useTagSettingsStore = create<TagSettingsStore>((set, get) => ({
  pinnedTags: [],
  customTags: [],

  async hydrate() {
    const result = await chrome.storage.local.get(["pinnedTags", "customTags"])
    set({
      pinnedTags: (result.pinnedTags as string[] | undefined) ?? [],
      customTags: (result.customTags as string[] | undefined) ?? [],
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
    const { customTags, pinnedTags } = get()
    const nextCustom = customTags.filter((t) => t !== name)
    const nextPinned = pinnedTags.filter((t) => t !== name)
    await chrome.storage.local.set({ customTags: nextCustom, pinnedTags: nextPinned })
    set({ customTags: nextCustom, pinnedTags: nextPinned })
  },

  async renameCustomTag(oldName, newName) {
    const { customTags, pinnedTags } = get()
    const nextCustom = customTags.map((t) => (t === oldName ? newName : t))
    const nextPinned = pinnedTags.map((t) => (t === oldName ? newName : t))
    await chrome.storage.local.set({ customTags: nextCustom, pinnedTags: nextPinned })
    set({ customTags: nextCustom, pinnedTags: nextPinned })
  },
}))
