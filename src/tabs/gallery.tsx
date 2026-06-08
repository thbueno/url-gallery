import "@/style.css"

import { useVirtualizer } from "@tanstack/react-virtual"
import { BookmarkIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { SiteCard } from "@/components/gallery/SiteCard"
import { Skeleton } from "@/components/ui/skeleton"
import { savedSiteStore } from "@/lib/store"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useGalleryStore } from "@/store/galleryStore"

// ── Column count from container width ────────────────────────────────────────

const MIN_CARD_WIDTH = 220 // px — matches --card-min-width token (14rem ≈ 224px)
const CARD_GAP = 16 // px — gap-4

function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>): number {
  const [cols, setCols] = useState(0)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setCols(Math.max(1, Math.floor((w + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP))))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])
  return cols
}

// ── Gallery page ─────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const sites = useGalleryStore((s) => s.sites)
  const categories = useGalleryStore((s) => s.categories)
  const activeCategory = useGalleryStore((s) => s.activeCategory)
  const isLoading = useGalleryStore((s) => s.isLoading)
  const load = useGalleryStore((s) => s.load)
  const setActiveCategory = useGalleryStore((s) => s.setActiveCategory)

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

  const totalCount = categories.reduce((n, c) => n + c.count, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2 px-4 py-5">
          <BookmarkIcon size={15} className="text-foreground/50" />
          <span className="text-sm font-semibold tracking-tight">URL Gallery</span>
        </div>

        <nav className="px-2 pb-4">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Categories
          </p>

          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
              activeCategory === null
                ? "bg-accent font-medium text-accent-foreground"
                : "text-sidebar-foreground hover:bg-accent/60"
            )}
          >
            <span>All</span>
            <span className="tabular-nums text-xs text-muted-foreground">{totalCount}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(cat.name === activeCategory ? null : cat.name)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                activeCategory === cat.name
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-sidebar-foreground hover:bg-accent/60"
              )}
            >
              <span className="truncate">{cat.name}</span>
              <span className="ml-2 shrink-0 tabular-nums text-xs text-muted-foreground">
                {cat.count}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3.5">
          <h1 className="text-sm font-semibold">{activeCategory ?? "All sites"}</h1>
          <span className="tabular-nums text-xs text-muted-foreground">
            {isLoading ? "…" : `${sites.length} site${sites.length !== 1 ? "s" : ""}`}
          </span>
        </div>

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

          {/* Empty state */}
          {!isLoading && cols > 0 && sites.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <BookmarkIcon size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {activeCategory ? `No ${activeCategory} sites saved` : "No saved sites yet"}
              </p>
              <p className="text-xs text-muted-foreground/60">
                Click the bookmark button on any page to save it
              </p>
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
                        <SiteCard key={site.id ?? site.url} site={site} onClick={handleCardClick} />
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
