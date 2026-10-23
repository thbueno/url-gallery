import { useEffect, useRef, useState } from "react"

import { allPinned, rangeIds } from "@/lib/bulk-selection"
import { UNCATEGORIZED } from "@/lib/categorizer"
import type { SavedSite } from "@/lib/store"
import { useGalleryStore } from "@/store/galleryStore"

/** Select mode state plus the bulk tag / pin / delete actions that act on the selection. */
export function useBulkSelection() {
  const sites = useGalleryStore((s) => s.sites)
  const updateSiteTags = useGalleryStore((s) => s.updateSiteTags)
  const deleteSite = useGalleryStore((s) => s.deleteSite)
  const togglePin = useGalleryStore((s) => s.togglePin)

  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  // Last plainly-clicked site: the start of a Shift-click range.
  const anchorId = useRef<number | null>(null)

  function visibleIds() {
    return sites.flatMap((s) => (s.id === undefined ? [] : [s.id]))
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
    anchorId.current = null
  }

  function toggleSelectMode() {
    if (selectMode) exitSelectMode()
    else setSelectMode(true)
  }

  // Esc leaves select mode (menus and dialogs handle Esc first and mark it handled).
  // biome-ignore lint/correctness/useExhaustiveDependencies: exitSelectMode only uses stable setters and a ref
  useEffect(() => {
    if (!selectMode) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.defaultPrevented) return
      if (document.querySelector('[role="menu"], [role="alertdialog"]')) return
      exitSelectMode()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectMode])

  function toggleSelect(site: SavedSite, shiftKey = false) {
    if (site.id === undefined) return
    const id = site.id
    if (shiftKey && anchorId.current !== null) {
      const range = rangeIds(visibleIds(), anchorId.current, id)
      setSelectedIds((prev) => new Set([...prev, ...range]))
      return
    }
    anchorId.current = id
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
    anchorId.current = null
  }

  /** Selects every site currently visible under the search and tag filter. */
  function selectAll() {
    setSelectedIds(new Set(visibleIds()))
  }

  async function deleteSelected() {
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      await deleteSite(id)
    }
    exitSelectMode()
  }

  function selectedSites() {
    return sites.filter((s) => s.id !== undefined && selectedIds.has(s.id))
  }

  async function addTagToSelected(tag: string) {
    const name = tag.trim()
    if (!name || name === UNCATEGORIZED) return
    for (const site of selectedSites()) {
      if (site.id === undefined) continue
      if (site.tags.includes(name)) continue
      const newTags = [...site.tags.filter((t) => t !== UNCATEGORIZED), name]
      await updateSiteTags(site.id, newTags)
    }
  }

  async function removeTagFromSelected(tag: string) {
    for (const site of selectedSites()) {
      if (site.id === undefined) continue
      let newTags = site.tags.filter((t) => t !== tag)
      if (newTags.length === 0) newTags = [UNCATEGORIZED]
      await updateSiteTags(site.id, newTags)
    }
  }

  /** Unpins the selection if all of it is pinned, otherwise pins all of it. */
  async function togglePinSelected() {
    const chosen = selectedSites()
    const pin = !allPinned(chosen)
    for (const site of chosen) {
      if (site.id !== undefined && !!site.pinned !== pin) await togglePin(site.id, pin)
    }
  }

  return {
    selectMode,
    selectedIds,
    selectedSites,
    toggleSelectMode,
    toggleSelect,
    clearSelection,
    selectAll,
    deleteSelected,
    addTagToSelected,
    removeTagFromSelected,
    togglePinSelected,
    exitSelectMode,
  }
}
