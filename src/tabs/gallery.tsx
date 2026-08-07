import "@/style.css"

import { useVirtualizer } from "@tanstack/react-virtual"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookmarkIcon,
  ClockIcon,
  ImageIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { CategoryFilter } from "@/components/gallery/CategoryFilter"
import { SiteCard } from "@/components/gallery/SiteCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ALL_TAGS } from "@/lib/categorizer"
import { parseMessage } from "@/lib/messages"
import { savedSiteStore } from "@/lib/store"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useGalleryStore } from "@/store/galleryStore"
import { useTagSettingsStore } from "@/store/tagSettingsStore"

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

// ── Revisit strip ─────────────────────────────────────────────────────────────

function RevisitStrip({
  sites,
  onOpen,
}: {
  sites: SavedSite[]
  onOpen: (site: SavedSite) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  if (sites.length === 0) return null
  return (
    <div className="mb-4 shrink-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ClockIcon size={12} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Revisit</span>
          <span className="tabular-nums text-[10px] text-muted-foreground/60">
            — saved but never opened
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-[10px] text-muted-foreground/60 underline-offset-2 hover:underline"
        >
          {collapsed ? "show" : "hide"}
        </button>
      </div>
      {!collapsed && (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {sites.map((site) => (
            <SiteCard
              key={site.id ?? site.url}
              site={site}
              onClick={onOpen}
              className="w-44 shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Permission-declined banner ────────────────────────────────────────────────

function PermissionBanner({ onDismiss }: { onDismiss: () => void }) {
  const [requesting, setRequesting] = useState(false)

  async function handleEnable() {
    setRequesting(true)
    try {
      const granted = await chrome.permissions.request({ origins: ["https://*/*"] })
      if (granted) {
        await chrome.storage.local.remove("permissionDeclined")
        onDismiss()
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

async function seedDatabase(): Promise<void> {
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  for (let i = 0; i < 1000; i++) {
    const domain = SEED_DOMAINS[i % SEED_DOMAINS.length] ?? "example.com"
    const tag = ALL_TAGS[i % ALL_TAGS.length] ?? "Uncategorized"
    await savedSiteStore.add({
      url: `https://${domain}/item-${i}`,
      title: `Seeded Site #${i + 1} — ${domain}`,
      favicon: null,
      thumb: null,
      tags: [tag],
    })
  }
  // Backdate the last 20 records to 8 days ago — exercises the resurface strip
  const all = await savedSiteStore.getAll()
  for (const site of all.slice(-20)) {
    if (site.id !== undefined) {
      await savedSiteStore.update(site.id, { savedAt: now - 8 * DAY })
    }
  }
}

// ── Gallery page ─────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const sites = useGalleryStore((s) => s.sites)
  const tags = useGalleryStore((s) => s.tags)
  const resurfaceSites = useGalleryStore((s) => s.resurfaceSites)
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
  const hydrateTags = useTagSettingsStore((s) => s.hydrate)
  const togglePinTag = useTagSettingsStore((s) => s.togglePinTag)
  const addCustomTag = useTagSettingsStore((s) => s.addCustomTag)
  const removeCustomTag = useTagSettingsStore((s) => s.removeCustomTag)
  const renameCustomTag = useTagSettingsStore((s) => s.renameCustomTag)

  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [filterVersion, setFilterVersion] = useState(0)
  const hasMounted = useRef(false)
  const isFirstActiveTags = useRef(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true"
    } catch {
      return false
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
    window.open(site.url, "_blank")
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

  // Merge site-derived tags with custom tags (count 0 for unassigned custom tags)
  const mergedTags = [
    ...tags,
    ...customTags
      .filter((ct) => !tags.some((st) => st.name === ct))
      .map((ct) => ({ name: ct, count: 0 })),
  ]

  const totalCount = tags.reduce((n, c) => n + c.count, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar",
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
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <CategoryFilter
              tags={mergedTags}
              activeTags={activeTags}
              pinnedTags={pinnedTags}
              totalCount={totalCount}
              onSelect={setActiveTags}
              onTogglePinTag={togglePinTag}
              onRenameTag={handleTagRename}
              onDeleteTag={handleTagDelete}
              onAddTag={handleTagAdd}
            />
          </div>
        )}

        {!sidebarCollapsed && process.env.NODE_ENV === "development" && (
          <div className="mt-auto shrink-0 border-t border-sidebar-border p-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={isSeeding}
              className="h-7 w-full justify-start px-2 text-[11px] text-muted-foreground"
              onClick={async () => {
                setIsSeeding(true)
                await seedDatabase()
                await load()
                setIsSeeding(false)
              }}
            >
              {isSeeding ? "Seeding…" : "Seed DB"}
            </Button>
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

          {/* Pinned tag chips — segmented pill control, centered in header */}
          <div className="flex flex-1 justify-center">
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
          </div>

          {/* Spacer to balance the search input width, keeping the pill row visually centered */}
          <div className="w-56 shrink-0" aria-hidden="true" />
        </div>

        {showPermissionBanner && (
          <PermissionBanner onDismiss={() => setShowPermissionBanner(false)} />
        )}

        {/* Scroll container — bounded height required for virtualization */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-6">
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

          {/* Revisit strip — sites saved 7+ days ago, never opened */}
          {!isLoading && cols > 0 && (
            <RevisitStrip sites={resurfaceSites} onOpen={handleCardClick} />
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
