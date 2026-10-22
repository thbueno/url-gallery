import { useVirtualizer } from "@tanstack/react-virtual"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { GalleryEmptyState } from "@/components/gallery/GalleryEmptyState"
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton"
import { SiteCard } from "@/components/gallery/SiteCard"
import { CARD_GAP, MIN_CARD_WIDTH, useColumnCount } from "@/hooks/useColumnCount"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface GalleryGridProps {
  sites: SavedSite[]
  isLoading: boolean
  searchQuery: string
  activeTags: string[]
  /** Tag names offered in each card's "+" tag menu. */
  availableTags: string[]
  selectMode: boolean
  selectedIds: Set<number>
  onOpenSite: (site: SavedSite) => void
  onTagsChange: (site: SavedSite, tags: string[]) => void
  onPinToggle: (site: SavedSite, pinned: boolean) => void
  onDeleteSite: (site: SavedSite) => void
  onToggleSelect: (site: SavedSite) => void
  onClearSearch: () => void
  className?: string
}

/** Scrollable, row-virtualized card grid with loading and empty states. */
export function GalleryGrid({
  sites,
  isLoading,
  searchQuery,
  activeTags,
  availableTags,
  selectMode,
  selectedIds,
  onOpenSite,
  onTagsChange,
  onPinToggle,
  onDeleteSite,
  onToggleSelect,
  onClearSearch,
  className,
}: GalleryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cols = useColumnCount(scrollRef)
  const rowCount = cols > 0 ? Math.ceil(sites.length / cols) : 0

  const hasMounted = useRef(false)
  const isFirstActiveTags = useRef(true)
  const [filterVersion, setFilterVersion] = useState(0)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    // Estimate: 16:10 thumbnail + title/domain rows + tag row + card padding at MIN_CARD_WIDTH, plus the
    // gap. measureElement refines it once rows render.
    estimateSize: () => Math.round((MIN_CARD_WIDTH * 10) / 16) + 112 + CARD_GAP,
    overscan: 3,
  })

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

  return (
    // Scroll container — bounded height required for virtualization
    <div ref={scrollRef} className={cn("scrollbar-minimal overflow-auto p-6", className)}>
      {/* Loading skeleton or empty first-render */}
      {(isLoading || cols === 0) && <GallerySkeleton cols={cols} />}

      {/* Empty state */}
      {!isLoading && cols > 0 && sites.length === 0 && (
        <GalleryEmptyState
          searchQuery={searchQuery}
          activeTags={activeTags}
          onClearSearch={onClearSearch}
        />
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
                          onClick={onOpenSite}
                          onTagsChange={onTagsChange}
                          onPinToggle={onPinToggle}
                          onDelete={onDeleteSite}
                          availableTags={availableTags}
                          selectMode={selectMode}
                          selected={site.id !== undefined && selectedIds.has(site.id)}
                          onToggleSelect={onToggleSelect}
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
  )
}
