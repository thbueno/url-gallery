import {
  type BackupSite,
  type TagSettings,
  exportBackup,
  parseBackup,
  toAIDigest,
} from "@/lib/backup"
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

const BASE64_CHUNK = 0x8000

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ""
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_CHUNK))
  }
  return `data:${blob.type};base64,${btoa(binary)}`
}

function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;,]*);base64,(.*)$/s.exec(dataUrl)
  if (!match) throw new Error("Backup thumbnail is not a base64 data URL")
  const binary = atob(match[2] ?? "")
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: match[1] ?? "" })
}

async function toBackupSite(site: SavedSite): Promise<BackupSite> {
  return {
    url: site.url,
    title: site.title,
    favicon: site.favicon,
    thumb: site.thumb ? await blobToDataUrl(site.thumb) : null,
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

const TAG_SETTING_KEYS = ["pinnedTags", "customTags", "tagOrder"]

async function readTagSettings(): Promise<TagSettings> {
  const stored = await chrome.storage.local.get(TAG_SETTING_KEYS)
  return {
    pinnedTags: (stored.pinnedTags as string[] | undefined) ?? [],
    customTags: (stored.customTags as string[] | undefined) ?? [],
    tagOrder: (stored.tagOrder as string[] | undefined) ?? [],
  }
}

/** Existing entries first, then incoming ones not already present. */
function union(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])]
}

/** Serializes every saved site (thumbnails included) and the tag settings to v2 backup JSON. */
export async function buildBackup(): Promise<string> {
  const sites = await savedSiteStore.getAll()
  return exportBackup(await Promise.all(sites.map(toBackupSite)), await readTagSettings())
}

/**
 * Restores a backup file's text: adds sites whose URL isn't already saved (keeping their
 * savedAt, openCount, pinned and thumbnail) and returns the sites that were added.
 */
export async function restoreBackup(text: string): Promise<SavedSite[]> {
  const { sites, tagSettings } = parseBackup(text)
  const added = await savedSiteStore.bulkRestore(
    sites.map((s) => ({
      url: s.url,
      title: s.title,
      favicon: s.favicon,
      thumb: s.thumb === null ? null : dataUrlToBlob(s.thumb),
      tags: s.tags,
      savedAt: s.savedAt,
      openCount: s.openCount,
      pinned: s.pinned,
    }))
  )
  if (tagSettings) {
    const existing = await readTagSettings()
    await chrome.storage.local.set({
      pinnedTags: union(existing.pinnedTags, tagSettings.pinnedTags),
      customTags: union(existing.customTags, tagSettings.customTags),
      tagOrder: union(existing.tagOrder, tagSettings.tagOrder),
    })
  }
  return added
}

export async function exportGallery(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  downloadText(`url-gallery-backup-${today}.json`, await buildBackup(), "application/json")
}

export async function copyGalleryForAI(): Promise<void> {
  const sites = await savedSiteStore.getAll()
  await navigator.clipboard.writeText(toAIDigest(sites))
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
// backfill a real thumbnail for each new site without one by re-reading the page's og:image
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
  const added = await restoreBackup(await file.text())

  const hasThumbnailPermission = await chrome.permissions.contains({
    origins: ["https://*/*"],
  })

  // Restored thumbnails are kept; only sites without one need a real thumbnail fetched.
  const needThumbnail = added.filter((s) => s.thumb === null)

  if (hasThumbnailPermission) {
    void backfillThumbnails(needThumbnail)
  }

  return {
    added: added.length,
    thumbnailsSkipped: !hasThumbnailPermission && needThumbnail.length > 0,
  }
}
