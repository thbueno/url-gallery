import { useState } from "react"

import type { SavedSite } from "@/lib/store"
import { useGalleryStore } from "@/store/galleryStore"

/** Select mode state plus the bulk tag / delete actions that act on the selection. */
export function useBulkSelection() {
  const sites = useGalleryStore((s) => s.sites)
  const updateSiteTags = useGalleryStore((s) => s.updateSiteTags)
  const deleteSite = useGalleryStore((s) => s.deleteSite)

  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  function toggleSelectMode() {
    setSelectMode((prev) => {
      const next = !prev
      if (!next) setSelectedIds(new Set())
      return next
    })
  }

  function toggleSelect(site: SavedSite) {
    if (site.id === undefined) return
    const id = site.id
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function deleteSelected() {
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      await deleteSite(id)
    }
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  async function addTagToSelected(tag: string) {
    const targets = sites.filter((s) => s.id !== undefined && selectedIds.has(s.id))
    for (const site of targets) {
      if (site.id === undefined) continue
      if (site.tags.includes(tag)) continue
      const newTags = [...site.tags.filter((t) => t !== "Uncategorized"), tag]
      await updateSiteTags(site.id, newTags)
    }
  }

  async function removeTagFromSelected(tag: string) {
    const targets = sites.filter((s) => s.id !== undefined && selectedIds.has(s.id))
    for (const site of targets) {
      if (site.id === undefined) continue
      let newTags = site.tags.filter((t) => t !== tag)
      if (newTags.length === 0) newTags = ["Uncategorized"]
      await updateSiteTags(site.id, newTags)
    }
  }

  return {
    selectMode,
    selectedIds,
    toggleSelectMode,
    toggleSelect,
    clearSelection,
    deleteSelected,
    addTagToSelected,
    removeTagFromSelected,
  }
}
