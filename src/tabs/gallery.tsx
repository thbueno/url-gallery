import "@/style.css"

import { useVirtualizer } from "@tanstack/react-virtual"
import { BookmarkIcon, ClockIcon, FlameIcon, ImageIcon, SearchIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { CategoryFilter } from "@/components/gallery/CategoryFilter"
import { SiteCard } from "@/components/gallery/SiteCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/categorizer"
import { ALL_CATEGORIES } from "@/lib/categorizer"
import { savedSiteStore } from "@/lib/store"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { type SortOrder, useGalleryStore } from "@/store/galleryStore"

// ── Column count from container width ────────────────────────────────────────

const MIN_CARD_WIDTH = 220 // px — matches --card-min-width token (14rem ≈ 224px)
const CARD_GAP = 16 // px — gap-4

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
        <div className="flex gap-3 overflow-x-auto pb-1">
          {sites.map((site) => (
            <SiteCard
              key={site.id ?? site.url}
              site={site}
              onClick={onOpen}
              className="w-40 shrink-0 aspect-[4/3]"
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
    const category = ALL_CATEGORIES[i % ALL_CATEGORIES.length] ?? "Uncategorized"
    await savedSiteStore.add({
      url: `https://${domain}/item-${i}`,
      title: `Seeded Site #${i + 1} — ${domain}`,
      favicon: null,
      thumb: null,
      category,
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
  const categories = useGalleryStore((s) => s.categories)
  const resurfaceSites = useGalleryStore((s) => s.resurfaceSites)
  const activeCategory = useGalleryStore((s) => s.activeCategory)
  const sortOrder = useGalleryStore((s) => s.sortOrder)
  const isLoading = useGalleryStore((s) => s.isLoading)
  const searchQuery = useGalleryStore((s) => s.searchQuery)
  const load = useGalleryStore((s) => s.load)
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery)
  const setActiveCategory = useGalleryStore((s) => s.setActiveCategory)
  const setSortOrder = useGalleryStore((s) => s.setSortOrder)
  const updateSiteCategory = useGalleryStore((s) => s.updateSiteCategory)
  const togglePin = useGalleryStore((s) => s.togglePin)

  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    chrome.storage.local.get("permissionDeclined", (result) => {
      if (result.permissionDeclined === true) setShowPermissionBanner(true)
    })
  }, [])

  const scrollRef = useRef<HTMLDivElement>(null)
  const cols = useColumnCount(scrollRef)
  const rowCount = cols > 0 ? Math.ceil(sites.length / cols) : 0

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    // Estimate based on 4:3 card at MIN_CARD_WIDTH + gap; measureElement refines it
    estimateSize: () => Math.round((MIN_CARD_WIDTH * 3) / 4) + CARD_GAP,
    overscan: 3,
  })

  useEffect(() => {
    load()
  }, [load])

  async function handleCardClick(site: SavedSite) {
    if (site.id !== undefined) {
      await savedSiteStore.incrementOpenCount(site.id)
    }
    window.open(site.url, "_blank")
  }

  async function handleCategoryChange(site: SavedSite, category: Category) {
    if (site.id !== undefined) {
      await updateSiteCategory(site.id, category)
    }
  }

  async function handlePinToggle(site: SavedSite, pinned: boolean) {
    if (site.id !== undefined) {
      await togglePin(site.id, pinned)
    }
  }

  function handleSortOrder(order: SortOrder) {
    setSortOrder(order)
  }

  const totalCount = categories.reduce((n, c) => n + c.count, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2 px-4 py-5">
          <BookmarkIcon size={15} className="text-foreground/50" />
          <span className="text-sm font-semibold tracking-tight">URL Gallery</span>
        </div>

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          totalCount={totalCount}
          onSelect={setActiveCategory}
        />
      </aside>

      {/* ── Main ── */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="relative flex-1">
            <SearchIcon
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved sites…"
              className="h-8 pl-7 pr-7 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon size={13} />
              </button>
            )}
          </div>

          {/* Sort toggle */}
          <div className="flex shrink-0 items-center gap-1 rounded-md border bg-muted/40 p-0.5">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 gap-1 px-2 text-[11px]",
                sortOrder === "savedAt" && "bg-background shadow-sm"
              )}
              onClick={() => handleSortOrder("savedAt")}
            >
              <ClockIcon size={11} />
              Recent
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 gap-1 px-2 text-[11px]",
                sortOrder === "openCount" && "bg-background shadow-sm"
              )}
              onClick={() => handleSortOrder("openCount")}
            >
              <FlameIcon size={11} />
              Most used
            </Button>
          </div>

          <span
            className={cn(
              "shrink-0 tabular-nums text-xs text-muted-foreground",
              isLoading && "opacity-0"
            )}
          >
            {sites.length} site{sites.length !== 1 ? "s" : ""}
          </span>

          {process.env.NODE_ENV === "development" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isSeeding}
              className="h-7 px-2 text-[11px] text-muted-foreground"
              onClick={async () => {
                setIsSeeding(true)
                await seedDatabase()
                await load()
                setIsSeeding(false)
              }}
            >
              {isSeeding ? "Seeding…" : "Seed DB"}
            </Button>
          )}
        </div>

        {showPermissionBanner && (
          <PermissionBanner onDismiss={() => setShowPermissionBanner(false)} />
        )}

        {/* Scroll container — bounded height required for virtualization */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-4">
          {/* Loading skeleton or empty first-render */}
          {(isLoading || cols === 0) && (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols || 4}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: (cols || 4) * 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton list
                <Skeleton key={i} className="aspect-[4/3] rounded-card" />
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
                    {activeCategory ? `No ${activeCategory} sites saved` : "No saved sites yet"}
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
                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                      {rowSites.map((site) => (
                        <SiteCard
                          key={site.id ?? site.url}
                          site={site}
                          onClick={handleCardClick}
                          onCategoryChange={handleCategoryChange}
                          onPinToggle={handlePinToggle}
                        />
                      ))}
                    </div>
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
