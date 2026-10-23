import { type BackupSite, exportBackup, parseBackup, toAIDigest } from "@/lib/backup"
import { ALL_TAGS } from "@/lib/categorizer"
import { savedSiteStore } from "@/lib/store"
import type { SavedSite } from "@/lib/store"

// ── Dev seed ──────────────────────────────────────────────────────────────────

const SEED_DOMAINS = [
  "github.com",
  "stackoverflow.com",
  "youtube.com",
  "twitter.com",
  "reddit.com",
  "figma.com",
  "docs.google.com",
  "npmjs.com",
  "medium.com",
  "vercel.com",
]

export const SEED_TOTAL = 20

export async function seedDatabase(): Promise<void> {
  const sites = Array.from({ length: SEED_TOTAL }, (_, i) => {
    const domain = SEED_DOMAINS[i % SEED_DOMAINS.length] ?? "example.com"
    const tag = ALL_TAGS[i % ALL_TAGS.length] ?? "Uncategorized"
    return {
      url: `https://${domain}/item-${i}`,
      title: `Seeded Site #${i + 1} — ${domain}`,
      favicon: null,
      thumb: null,
      tags: [tag],
    }
  })

  await savedSiteStore.bulkAdd(sites)
}

// ── Backup / AI-context ───────────────────────────────────────────────────────

function toBackupSite(site: SavedSite): BackupSite {
  return {
    url: site.url,
    title: site.title,
    favicon: site.favicon,
    tags: site.tags,
    savedAt: site.savedAt,
    openCount: site.openCount,
    pinned: site.pinned,
  }
}

function downloadText(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportGallery(): Promise<void> {
  const sites = await savedSiteStore.getAll()
  const today = new Date().toISOString().slice(0, 10)
  downloadText(
    `url-gallery-backup-${today}.json`,
    exportBackup(sites.map(toBackupSite)),
    "application/json"
  )
}

export async function copyGalleryForAI(): Promise<void> {
  const sites = await savedSiteStore.getAll()
  await navigator.clipboard.writeText(toAIDigest(sites.map(toBackupSite)))
}

// Asks the service worker for a real thumbnail of each site, one at a time so
// we don't fire dozens of parallel page fetches. With no `sites`, backfills every
// saved site whose thumbnail is still null. A failure on one site (e.g. the
// service worker restarting) must not abort the rest.
export async function backfillThumbnails(sites: SavedSite[] | null): Promise<void> {
  const targets = sites ?? (await savedSiteStore.getAll()).filter((s) => s.thumb === null)
  for (const site of targets) {
    if (site.id === undefined) continue
    try {
      await chrome.runtime.sendMessage({
        type: "REFRESH_THUMBNAIL",
        id: site.id,
        url: site.url,
        faviconUrl: site.favicon,
      })
    } catch {
      // Skip this site; its thumb stays null and can be retried later.
    }
  }
}

// Imports a backup file, merges new URLs, then asks the service worker to
// backfill a real thumbnail for each new site by re-reading the page's og:image
// — one at a time, so the import doesn't fire dozens of parallel page fetches.
// The backfill isn't awaited: each finished thumbnail broadcasts SITE_SAVED and
// the grid reloads, so thumbnails fill in progressively while the import status
// shows immediately.
//
// The page fetch happens in the service worker, which needs the https://*/*
// optional host permission granted before it can fetch an arbitrary domain. A
// fresh profile/browser never has it granted yet, so we check first and skip
// the (otherwise silently-failing) backfill entirely — the caller uses
// `thumbnailsSkipped` to tell the user why thumbnails stayed favicons.
export async function importGallery(
  file: File
): Promise<{ added: number; thumbnailsSkipped: boolean }> {
  const parsed = parseBackup(await file.text())
  const added = await savedSiteStore.bulkAddNew(
    parsed.map((s) => ({
      url: s.url,
      title: s.title,
      favicon: s.favicon,
      thumb: null,
      tags: s.tags,
    }))
  )

  const hasThumbnailPermission = await chrome.permissions.contains({
    origins: ["https://*/*"],
  })

  if (hasThumbnailPermission) {
    void backfillThumbnails(added)
  }

  return {
    added: added.length,
    thumbnailsSkipped: !hasThumbnailPermission && added.length > 0,
  }
}
