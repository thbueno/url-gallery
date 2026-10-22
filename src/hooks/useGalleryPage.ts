import { useState } from "react"

import type { GalleryPage } from "@/components/gallery/SidebarNav"

function readPage(): GalleryPage {
  return new URLSearchParams(window.location.search).get("page") === "overview"
    ? "overview"
    : "gallery"
}

/** Which gallery page is showing. Mirrored in `?page=` so a reload stays on the same page. */
export function useGalleryPage(): [GalleryPage, (page: GalleryPage) => void] {
  const [page, setPageState] = useState<GalleryPage>(readPage)

  function setPage(next: GalleryPage) {
    setPageState(next)
    const url = new URL(window.location.href)
    if (next === "overview") url.searchParams.set("page", "overview")
    else url.searchParams.delete("page")
    window.history.replaceState(null, "", url)
  }

  return [page, setPage]
}
