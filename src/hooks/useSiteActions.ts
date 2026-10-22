import { savedSiteStore } from "@/lib/store"
import type { SavedSite } from "@/lib/store"
import { useGalleryStore } from "@/store/galleryStore"

/** Per-card actions: open (with open-count), retag, pin and delete. */
export function useSiteActions() {
  const updateSiteTags = useGalleryStore((s) => s.updateSiteTags)
  const togglePin = useGalleryStore((s) => s.togglePin)
  const deleteSite = useGalleryStore((s) => s.deleteSite)

  async function openSite(site: SavedSite) {
    if (site.id !== undefined) {
      await savedSiteStore.incrementOpenCount(site.id)
    }
    const [existing] = await chrome.tabs.query({ url: site.url })
    if (existing?.id !== undefined) {
      await chrome.tabs.update(existing.id, { active: true })
      if (existing.windowId !== undefined) {
        await chrome.windows.update(existing.windowId, { focused: true })
      }
    } else {
      window.open(site.url, "_blank")
    }
  }

  async function changeTags(site: SavedSite, siteTags: string[]) {
    if (site.id !== undefined) {
      await updateSiteTags(site.id, siteTags)
    }
  }

  async function togglePinned(site: SavedSite, pinned: boolean) {
    if (site.id !== undefined) {
      await togglePin(site.id, pinned)
    }
  }

  async function removeSite(site: SavedSite) {
    if (site.id !== undefined) {
      await deleteSite(site.id)
    }
  }

  return { openSite, changeTags, togglePinned, removeSite }
}
