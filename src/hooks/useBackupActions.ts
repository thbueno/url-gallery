import { useState } from "react"

import { copyGalleryForAI, exportGallery, importGallery } from "@/lib/gallery-io"

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
