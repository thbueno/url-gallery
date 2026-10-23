import { useState } from "react"

import { copyGalleryForAI, exportGallery, importGallery } from "@/lib/gallery-io"
import { useTagSettingsStore } from "@/store/tagSettingsStore"

interface UseBackupActionsOptions {
  /** Reload the gallery after an import. */
  load: () => Promise<void>
  /** Called when an import added sites but the thumbnail permission isn't granted. */
  onThumbnailsSkipped: () => void
}

/** Data menu actions (export / import / copy for AI) plus the short-lived status line. */
export function useBackupActions({ load, onThumbnailsSkipped }: UseBackupActionsOptions) {
  const [status, setStatus] = useState<string | null>(null)

  function flashStatus(msg: string) {
    setStatus(msg)
    setTimeout(() => setStatus(null), 4000)
  }

  async function exportBackup() {
    await exportGallery()
    flashStatus("Backup downloaded")
  }

  async function copyForAI() {
    await copyGalleryForAI()
    flashStatus("Copied for AI")
  }

  async function importFile(file: File) {
    try {
      const { added, thumbnailsSkipped } = await importGallery(file)
      // The import may have merged tag settings in chrome.storage.local.
      // A failure here must not be reported as a bad backup file; the sites are already saved.
      await useTagSettingsStore
        .getState()
        .hydrate()
        .catch(() => {})
      await load()
      if (added === 0) {
        flashStatus("Nothing new to import")
      } else if (thumbnailsSkipped) {
        flashStatus(
          `Imported ${added} site${added === 1 ? "" : "s"} — grant the thumbnail permission above to fetch real thumbnails`
        )
        onThumbnailsSkipped()
      } else {
        flashStatus(`Imported ${added} site${added === 1 ? "" : "s"}`)
      }
    } catch {
      flashStatus("Import failed — not a valid backup file")
    }
  }

  return { status, exportBackup, copyForAI, importFile }
}
