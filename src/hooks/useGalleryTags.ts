import { useGalleryStore } from "@/store/galleryStore"
import { useTagSettingsStore, withEffectiveOrder } from "@/store/tagSettingsStore"

/** Site-derived tags merged with custom tags, in display order, plus the tag edit actions. */
export function useGalleryTags() {
  const tags = useGalleryStore((s) => s.tags)
  const renameTag = useGalleryStore((s) => s.renameTag)
  const deleteTag = useGalleryStore((s) => s.deleteTag)

  const customTags = useTagSettingsStore((s) => s.customTags)
  const tagOrder = useTagSettingsStore((s) => s.tagOrder)
  const addCustomTag = useTagSettingsStore((s) => s.addCustomTag)
  const removeCustomTag = useTagSettingsStore((s) => s.removeCustomTag)
  const renameCustomTag = useTagSettingsStore((s) => s.renameCustomTag)

  async function rename(oldName: string, newName: string) {
    await renameTag(oldName, newName)
    await renameCustomTag(oldName, newName)
  }

  async function remove(name: string) {
    await deleteTag(name)
    await removeCustomTag(name)
  }

  async function add(name: string) {
    await addCustomTag(name)
  }

  // Merge site-derived tags with custom tags (count 0 for unassigned custom tags)
  const mergedTags = [
    ...tags,
    ...customTags
      .filter((ct) => !tags.some((st) => st.name === ct))
      .map((ct) => ({ name: ct, count: 0 })),
  ]

  const effectiveTagOrder = withEffectiveOrder(
    tagOrder,
    mergedTags.map((t) => t.name)
  )

  const totalCount = tags.reduce((n, c) => n + c.count, 0)

  return { mergedTags, effectiveTagOrder, totalCount, rename, remove, add }
}
