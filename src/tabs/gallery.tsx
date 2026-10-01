import "@/style.css"

if (process.env.NODE_ENV === "development") {
  import("react-grab")
}

import { useVirtualizer } from "@tanstack/react-virtual"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookmarkIcon,
  ImageIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { CategoryFilter } from "@/components/gallery/CategoryFilter"
import { SiteCard } from "@/components/gallery/SiteCard"
import { ThemeToggle } from "@/components/gallery/ThemeToggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { type BackupSite, exportBackup, parseBackup, toAIDigest } from "@/lib/backup"
import { ALL_TAGS } from "@/lib/categorizer"
import { parseMessage } from "@/lib/messages"
import { savedSiteStore } from "@/lib/store"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useGalleryStore } from "@/store/galleryStore"
import { useTagSettingsStore, withEffectiveOrder } from "@/store/tagSettingsStore"

// ── Column count from container width ────────────────────────────────────────

const MIN_CARD_WIDTH = 220 // px — matches --card-min-width token (14rem ≈ 224px)
const CARD_GAP = 24 // px — gap-6, mirrors --gallery-gap

function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>): number {
  const [cols, setCols] = useState(0)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const w = entry.contentRect.width
      setCols(Math.max(1, Math.floor((w + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP))))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])
  return cols
}

// ── Permission-declined banner ────────────────────────────────────────────────

function PermissionBanner({
  onDismiss,
  onGranted,
}: {
  onDismiss: () => void
  onGranted: () => void
}) {
  const [requesting, setRequesting] = useState(false)

  async function handleEnable() {
    setRequesting(true)
    try {
      const granted = await chrome.permissions.request({ origins: ["https://*/*"] })
      if (granted) {
        await chrome.storage.local.remove("permissionDeclined")
        onDismiss()
        onGranted()
      }
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
      <ImageIcon size={13} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 text-xs text-muted-foreground">
        Thumbnails are showing page icons.{" "}
        <button
          type="button"
          disabled={requesting}
          onClick={handleEnable}
          className="font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-50"
        >
          Enable full thumbnails
        </button>
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground"
      >
        <XIcon size={13} />
      </button>
    </div>
  )
}

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

const SEED_TOTAL = 20

async function seedDatabase(): Promise<void> {
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

async function exportGallery(): Promise<void> {
  const sites = await savedSiteStore.getAll()
  const today = new Date().toISOString().slice(0, 10)
  downloadText(
    `url-gallery-backup-${today}.json`,
    exportBackup(sites.map(toBackupSite)),
    "application/json"
  )
}

async function copyGalleryForAI(): Promise<void> {
  const sites = await savedSiteStore.getAll()
  await navigator.clipboard.writeText(toAIDigest(sites.map(toBackupSite)))
}

// Asks the service worker for a real thumbnail of each site, one at a time so
// we don't fire dozens of parallel page fetches. With no `sites`, backfills every
// saved site whose thumbnail is still null. A failure on one site (e.g. the
// service worker restarting) must not abort the rest.
async function backfillThumbnails(sites: SavedSite[] | null): Promise<void> {
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
async function importGallery(file: File): Promise<{ added: number; thumbnailsSkipped: boolean }> {
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

// ── Gallery page ─────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const sites = useGalleryStore((s) => s.sites)
  const tags = useGalleryStore((s) => s.tags)
  const activeTags = useGalleryStore((s) => s.activeTags)
  const isLoading = useGalleryStore((s) => s.isLoading)
  const searchQuery = useGalleryStore((s) => s.searchQuery)
  const load = useGalleryStore((s) => s.load)
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery)
  const setActiveTags = useGalleryStore((s) => s.setActiveTags)
  const updateSiteTags = useGalleryStore((s) => s.updateSiteTags)
  const togglePin = useGalleryStore((s) => s.togglePin)
  const deleteSite = useGalleryStore((s) => s.deleteSite)
  const renameTag = useGalleryStore((s) => s.renameTag)
  const deleteTag = useGalleryStore((s) => s.deleteTag)

  const pinnedTags = useTagSettingsStore((s) => s.pinnedTags)
  const customTags = useTagSettingsStore((s) => s.customTags)
  const tagOrder = useTagSettingsStore((s) => s.tagOrder)
  const hydrateTags = useTagSettingsStore((s) => s.hydrate)
  const togglePinTag = useTagSettingsStore((s) => s.togglePinTag)
  const addCustomTag = useTagSettingsStore((s) => s.addCustomTag)
  const removeCustomTag = useTagSettingsStore((s) => s.removeCustomTag)
  const renameCustomTag = useTagSettingsStore((s) => s.renameCustomTag)
  const reorderTags = useTagSettingsStore((s) => s.reorderTags)

  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [filterVersion, setFilterVersion] = useState(0)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const hasMounted = useRef(false)
  const isFirstActiveTags = useRef(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") !== "false"
    } catch {
      return true
    }
  })

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("sidebar-collapsed", String(next))
      } catch {}
      return next
    })
  }

  useEffect(() => {
    chrome.storage.local.get("permissionDeclined", (result) => {
      if (result.permissionDeclined === true) setShowPermissionBanner(true)
    })
    hydrateTags()
  }, [hydrateTags])

  const scrollRef = useRef<HTMLDivElement>(null)
  const cols = useColumnCount(scrollRef)
  const rowCount = cols > 0 ? Math.ceil(sites.length / cols) : 0

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    // Estimate based on aspect-video image + content block at MIN_CARD_WIDTH + gap; measureElement refines it
    estimateSize: () => Math.round((MIN_CARD_WIDTH * 9) / 16) + 96 + CARD_GAP,
    overscan: 3,
  })

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const channel = new BroadcastChannel("url-gallery")
    channel.onmessage = (event) => {
      try {
        if (parseMessage(event.data).type === "SITE_SAVED") load()
      } catch {
        // ignore messages this tab doesn't care about
      }
    }
    return () => channel.close()
  }, [load])

  useEffect(() => {
    hasMounted.current = true
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeTags change triggers animation version bump
  useEffect(() => {
    if (isFirstActiveTags.current) {
      isFirstActiveTags.current = false
      return
    }
    setFilterVersion((v) => v + 1)
  }, [activeTags])

  async function handleCardClick(site: SavedSite) {
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

  async function handleTagsChange(site: SavedSite, siteTags: string[]) {
    if (site.id !== undefined) {
      await updateSiteTags(site.id, siteTags)
    }
  }

  async function handlePinToggle(site: SavedSite, pinned: boolean) {
    if (site.id !== undefined) {
      await togglePin(site.id, pinned)
    }
  }

  async function handleDelete(site: SavedSite) {
    if (site.id !== undefined) {
      await deleteSite(site.id)
    }
  }

  function toggleSelectMode() {
    setSelectMode((prev) => {
      const next = !prev
      if (!next) setSelectedIds(new Set())
      return next
    })
  }

  function handleToggleSelect(site: SavedSite) {
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

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      await deleteSite(id)
    }
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  async function handleBulkAddTag(tag: string) {
    const targets = sites.filter((s) => s.id !== undefined && selectedIds.has(s.id))
    for (const site of targets) {
      if (site.id === undefined) continue
      if (site.tags.includes(tag)) continue
      const newTags = [...site.tags.filter((t) => t !== "Uncategorized"), tag]
      await updateSiteTags(site.id, newTags)
    }
  }

  async function handleBulkRemoveTag(tag: string) {
    const targets = sites.filter((s) => s.id !== undefined && selectedIds.has(s.id))
    for (const site of targets) {
      if (site.id === undefined) continue
      let newTags = site.tags.filter((t) => t !== tag)
      if (newTags.length === 0) newTags = ["Uncategorized"]
      await updateSiteTags(site.id, newTags)
    }
  }

  async function handleTagRename(oldName: string, newName: string) {
    await renameTag(oldName, newName)
    await renameCustomTag(oldName, newName)
  }

  async function handleTagDelete(name: string) {
    await deleteTag(name)
    await removeCustomTag(name)
  }

  async function handleTagAdd(name: string) {
    await addCustomTag(name)
  }

  function flashStatus(msg: string) {
    setBackupStatus(msg)
    setTimeout(() => setBackupStatus(null), 4000)
  }

  async function handleExport() {
    await exportGallery()
    flashStatus("Backup downloaded")
  }

  async function handleCopyForAI() {
    await copyGalleryForAI()
    flashStatus("Copied for AI")
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const { added, thumbnailsSkipped } = await importGallery(file)
      await load()
      if (added === 0) {
        flashStatus("Nothing new to import")
      } else if (thumbnailsSkipped) {
        flashStatus(
          `Imported ${added} site${added === 1 ? "" : "s"} — grant the thumbnail permission above to fetch real thumbnails`
        )
        setShowPermissionBanner(true)
      } else {
        flashStatus(`Imported ${added} site${added === 1 ? "" : "s"}`)
      }
    } catch {
      flashStatus("Import failed — not a valid backup file")
    }
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

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "m-2 flex shrink-0 flex-col overflow-hidden rounded-card bg-card",
          "transition-[width] duration-200",
          sidebarCollapsed ? "w-10" : "w-60"
        )}
      >
        <div className="flex shrink-0 items-center gap-2 px-2 py-5">
          {!sidebarCollapsed && (
            <>
              <BookmarkIcon size={15} className="ml-2 text-foreground/50" />
              <span className="flex-1 text-sm font-semibold tracking-tight">URL Gallery</span>
            </>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {sidebarCollapsed ? <PanelLeftOpenIcon size={15} /> : <PanelLeftCloseIcon size={15} />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-y-auto">
            <CategoryFilter
              tags={mergedTags}
              activeTags={activeTags}
              pinnedTags={pinnedTags}
              tagOrder={effectiveTagOrder}
              totalCount={totalCount}
              onSelect={setActiveTags}
              onTogglePinTag={togglePinTag}
              onRenameTag={handleTagRename}
              onDeleteTag={handleTagDelete}
              onAddTag={handleTagAdd}
              onReorderTags={reorderTags}
            />
          </div>
        )}

        {!sidebarCollapsed && (
          <div className="mt-auto flex shrink-0 flex-col gap-1 p-2">
            {backupStatus && (
              <p className="px-2 text-[11px] text-muted-foreground">{backupStatus}</p>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 flex-1 justify-start px-2 text-[11px] text-muted-foreground"
                  >
                    Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuItem onSelect={handleExport}>Export backup</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => importInputRef.current?.click()}>
                    Import backup
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleCopyForAI}>Copy for AI</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {process.env.NODE_ENV === "development" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSeeding}
                      className="h-7 flex-1 justify-start px-2 text-[11px] text-muted-foreground"
                    >
                      {isSeeding ? "Seeding…" : "Seed DB"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Seed the database with test data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This inserts {SEED_TOTAL} synthetic test site records with fake URLs cycling
                        through a hardcoded domain list (github.com, stackoverflow.com, youtube.com,
                        twitter.com, reddit.com, figma.com, docs.google.com, npmjs.com, medium.com,
                        vercel.com). It is not real bookmarks or externally-fetched data — purely
                        local synthetic data for exercising the gallery UI.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          setIsSeeding(true)
                          await seedDatabase()
                          await load()
                          setIsSeeding(false)
                        }}
                      >
                        Seed database
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
              <ThemeToggle className="ml-auto" />
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 px-4 py-3.5">
          <div className="relative w-56">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search..."
              className="h-9 rounded-full pl-8 pr-8 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* Pinned tag chips (default) or bulk-action toolbar (select mode) — centered in header */}
          <div className="flex flex-1 justify-center">
            {selectMode ? (
              <div className="flex min-w-0 max-w-2xl shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2 py-1.5">
                <span className="px-2 text-sm font-medium tabular-nums">
                  {selectedIds.size} selected
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={selectedIds.size === 0}>
                      Add tag
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-[10px]">
                      Add tag to selected
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mergedTags
                      .filter((t) => t.name !== "Uncategorized")
                      .map((t) => (
                        <DropdownMenuItem key={t.name} onSelect={() => handleBulkAddTag(t.name)}>
                          {t.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={selectedIds.size === 0}>
                      Remove tag
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-[10px]">
                      Remove tag from selected
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mergedTags
                      .filter((t) => t.name !== "Uncategorized")
                      .map((t) => (
                        <DropdownMenuItem key={t.name} onSelect={() => handleBulkRemoveTag(t.name)}>
                          {t.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={selectedIds.size === 0}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete {selectedIds.size} site{selectedIds.size === 1 ? "" : "s"}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action can't be undone. This will permanently remove the selected sites
                        from your gallery.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  disabled={selectedIds.size === 0}
                  className="px-2 text-xs text-muted-foreground/60 underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="scrollbar-hide flex min-w-0 max-w-xl shrink-0 items-center gap-1.5 overflow-x-auto rounded-full border border-border bg-background p-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTags([])}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
                    activeTags.length === 0
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                {pinnedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTags(activeTags.includes(tag) ? [] : [tag])}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
                      activeTags.includes(tag)
                        ? "bg-foreground font-medium text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right slot — select-mode entry point, balances the search input width */}
          <div className="flex w-56 shrink-0 justify-end">
            <Button variant={selectMode ? "outline" : "ghost"} size="sm" onClick={toggleSelectMode}>
              {selectMode ? "Cancel" : "Select"}
            </Button>
          </div>
        </div>

        {showPermissionBanner && (
          <PermissionBanner
            onDismiss={() => setShowPermissionBanner(false)}
            onGranted={() => void backfillThumbnails(null)}
          />
        )}

        {/* Scroll container — bounded height required for virtualization */}
        <div ref={scrollRef} className="scrollbar-minimal min-h-0 flex-1 overflow-auto p-6">
          {/* Loading skeleton or empty first-render */}
          {(isLoading || cols === 0) && (
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(${cols || 4}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: (cols || 4) * 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton list
                <Skeleton key={i} className="aspect-[4/5] rounded-card" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && cols > 0 && sites.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              {searchQuery ? (
                <>
                  <SearchIcon size={28} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-muted-foreground/60 underline-offset-2 hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <BookmarkIcon size={28} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {activeTags.length > 0
                      ? `No sites tagged ${activeTags.join(" or ")}`
                      : "No saved sites yet"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Click the bookmark button on any page to save it
                  </p>
                </>
              )}
            </div>
          )}

          {/* Virtualized grid */}
          {!isLoading && cols > 0 && sites.length > 0 && (
            <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowStart = virtualRow.index * cols
                const rowSites = sites.slice(rowStart, rowStart + cols)
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                      paddingBottom: CARD_GAP,
                    }}
                  >
                    <AnimatePresence>
                      <motion.div
                        key={filterVersion}
                        initial={hasMounted.current ? { opacity: 0, y: 8 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.18,
                          delay: Math.min(virtualRow.index, 10) * 0.03,
                        }}
                      >
                        <div
                          className="grid gap-6"
                          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                        >
                          {rowSites.map((site) => (
                            <SiteCard
                              key={site.id ?? site.url}
                              site={site}
                              onClick={handleCardClick}
                              onTagsChange={handleTagsChange}
                              onPinToggle={handlePinToggle}
                              onDelete={handleDelete}
                              availableTags={effectiveTagOrder}
                              selectMode={selectMode}
                              selected={site.id !== undefined && selectedIds.has(site.id)}
                              onToggleSelect={handleToggleSelect}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
