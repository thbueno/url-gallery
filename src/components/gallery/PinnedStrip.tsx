import { SiteCard } from "@/components/gallery/SiteCard"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface PinnedStripProps {
  sites: SavedSite[]
  availableTags?: string[]
  selectMode?: boolean
  selectedIds?: Set<number>
  onOpenSite: (site: SavedSite) => void
  onTagsChange?: (site: SavedSite, tags: string[]) => void
  onPinToggle?: (site: SavedSite, pinned: boolean) => void
  onDeleteSite?: (site: SavedSite) => void
  onToggleSelect?: (site: SavedSite, shiftKey: boolean) => void
  className?: string
}

/** Up to 4 pinned sites as large cards: 2 columns, 4 from the `strip` breakpoint. Parents own placement. */
export function PinnedStrip({
  sites,
  availableTags,
  selectMode,
  selectedIds,
  onOpenSite,
  onTagsChange,
  onPinToggle,
  onDeleteSite,
  onToggleSelect,
  className,
}: PinnedStripProps) {
  if (sites.length === 0) return null
  return (
    <section
      aria-label="Pinned sites"
      className={cn("grid grid-cols-2 gap-6 strip:grid-cols-4", className)}
    >
      {sites.map((site) => (
        <SiteCard
          key={site.id ?? site.url}
          size="large"
          site={site}
          onClick={onOpenSite}
          onTagsChange={onTagsChange}
          onPinToggle={onPinToggle}
          onDelete={onDeleteSite}
          availableTags={availableTags}
          selectMode={selectMode}
          selected={site.id !== undefined && !!selectedIds?.has(site.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </section>
  )
}
