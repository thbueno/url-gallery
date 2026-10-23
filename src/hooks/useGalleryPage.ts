import { useState } from "react"

import { useGalleryStore } from "@/store/galleryStore"

export const GALLERY_PAGES = ["gallery", "overview"] as const

export type GalleryPage = (typeof GALLERY_PAGES)[number]

function readPage(): GalleryPage {
  return new URLSearchParams(window.location.search).get("page") === "overview"
    ? "overview"
    : "gallery"
}

/**
 * Which gallery page is showing, plus the sidebar actions that can change it. The page is
 * mirrored in `?page=` so a reload stays on the same page.
 */
export function useGalleryPage() {
  const [page, setPageState] = useState<GalleryPage>(readPage)
  const activeTags = useGalleryStore((s) => s.activeTags)
  const setActiveTags = useGalleryStore((s) => s.setActiveTags)
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery)

  function setPage(next: GalleryPage) {
    setPageState(next)
    const url = new URL(window.location.href)
    if (next === "overview") url.searchParams.set("page", "overview")
    else url.searchParams.delete("page")
    window.history.replaceState(null, "", url)
  }

  /** Picking a tag always brings you back to the gallery. */
  function selectTags(tags: string[]) {
    setPage("gallery")
    return setActiveTags(tags)
  }

  /** Typing a search brings you back to the gallery. */
  function changeSearch(value: string) {
    if (value.trim()) setPage("gallery")
    return setSearchQuery(value)
  }

  /** Sidebar nav click. Clicking "Gallery" while already on it resets the tag filter. */
  function navigate(next: GalleryPage) {
    setPage(next)
    if (next === "gallery" && page === "gallery" && activeTags.length > 0) void setActiveTags([])
  }

  return { page, setPage, selectTags, changeSearch, navigate }
}
