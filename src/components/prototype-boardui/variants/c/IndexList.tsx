import { ArrowDown, ArrowUp, Pin, SearchX } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { Favicon } from "../../atoms"
import { formatDate, getDomain, timeAgo } from "../../helpers"
import { CONTROL_BUTTON, type SortKey, type SortState, siteKey } from "./shared"

type Density = "compact" | "regular" | "wide"

/** Column templates per density. Fixed slots for icon / opens / saved keep every row aligned. */
const GRID: Record<Density, string> = {
  compact: "grid-cols-[1.25rem_minmax(0,1fr)_6rem_4.5rem]",
  regular: "grid-cols-[1.25rem_minmax(0,2fr)_minmax(0,1.2fr)_6rem_4.5rem]",
  wide: "grid-cols-[1.25rem_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_6rem_4.5rem]",
}

const ROW_BOX = "mx-2 grid items-center gap-3 px-3"

function useDensity(ref: React.RefObject<HTMLElement | null>): Density {
  const [density, setDensity] = React.useState<Density>("wide")
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = (w: number) => setDensity(w < 560 ? "compact" : w < 780 ? "regular" : "wide")
    update(el.clientWidth)
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) update(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return density
}

interface HeaderCellProps {
  label: string
  sortKey: SortKey
  sort: SortState | null
  onSort: (key: SortKey) => void
  align?: "left" | "right"
}

function HeaderCell({ label, sortKey, sort, onSort, align = "left" }: HeaderCellProps) {
  const active = sort?.key === sortKey
  const Arrow = sort?.dir === "asc" ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}`}
      className={cn(
        "group flex h-7 min-w-0 items-center gap-1 rounded-sm px-1 -mx-1 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        align === "right" && "justify-end",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* fixed-size slot so the label never shifts when the arrow appears */}
      <span
        className={cn(
          "flex size-3 shrink-0 items-center justify-center",
          align === "left" && "order-last"
        )}
      >
        <Arrow
          className={cn(
            "size-3 transition-opacity duration-150 ease-out",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
          )}
        />
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function TagChips({ tags }: { tags: string[] }) {
  const shown = tags.slice(0, 2)
  const extra = tags.length - shown.length
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
      {shown.map((t) => (
        <span
          key={t}
          className="max-w-[7rem] truncate rounded-sm bg-[hsl(var(--surface-tertiary))] px-1.5 py-0.5 text-xs leading-4 text-muted-foreground"
        >
          {t}
        </span>
      ))}
      {extra > 0 && (
        <span className="shrink-0 rounded-sm px-1 text-xs tabular-nums text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  )
}

interface RowProps {
  site: SavedSite
  density: Density
  selected: boolean
  maxOpens: number
  onSelect: (key: string) => void
  onOpen: (url: string) => void
}

const Row = React.memo(function Row({
  site,
  density,
  selected,
  maxOpens,
  onSelect,
  onOpen,
}: RowProps) {
  const key = siteKey(site)
  const pct =
    maxOpens > 0 ? Math.max(site.openCount > 0 ? 6 : 0, (site.openCount / maxOpens) * 100) : 0
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection (j/k/arrows/Enter) is handled globally in VariantC
    <div
      aria-current={selected ? "true" : undefined}
      data-key={key}
      onClick={() => onSelect(key)}
      onDoubleClick={() => onOpen(site.url)}
      className={cn(
        ROW_BOX,
        GRID[density],
        "group relative h-11 scroll-mt-10 scroll-mb-24 cursor-default rounded-lg transition-colors duration-150 ease-out",
        "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-[hsl(var(--separator))] after:transition-opacity after:duration-150",
        selected
          ? "bg-[hsl(var(--surface-section))] after:opacity-0"
          : "hover:bg-[hsl(var(--surface-section)/0.6)] hover:after:opacity-0"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-sm bg-primary transition-[opacity,transform] duration-150 ease-out",
          selected ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0"
        )}
      />
      <Favicon site={site} size="sm" />
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-sm font-medium" title={site.title}>
          {site.title}
        </span>
        {site.pinned && (
          <Pin aria-label="Pinned" className="size-3 shrink-0 text-muted-foreground" />
        )}
      </div>
      {density !== "compact" && (
        <span className="truncate text-sm text-muted-foreground">{getDomain(site.url)}</span>
      )}
      {density === "wide" && <TagChips tags={site.tags} />}
      <div className="flex items-center justify-end gap-2">
        <span
          aria-hidden="true"
          className="h-1 w-8 shrink-0 overflow-hidden rounded-sm bg-[hsl(var(--surface-tertiary))]"
        >
          <span className="block h-full rounded-sm bg-primary/70" style={{ width: `${pct}%` }} />
        </span>
        <span
          className={cn(
            "w-8 text-right text-sm tabular-nums",
            site.openCount > 0 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {site.openCount}
        </span>
      </div>
      <span
        className="truncate text-right text-sm tabular-nums text-muted-foreground"
        title={formatDate(site.savedAt)}
      >
        {timeAgo(site.savedAt)}
      </span>
    </div>
  )
})

function SkeletonRows({ density }: { density: Density }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: 12 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <div key={i} className={cn(ROW_BOX, GRID[density], "h-11")}>
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="h-3.5 w-3/5" />
          {density !== "compact" && <Skeleton className="h-3.5 w-4/5" />}
          {density === "wide" && <Skeleton className="h-5 w-24" />}
          <Skeleton className="ml-auto h-3.5 w-12" />
          <Skeleton className="ml-auto h-3.5 w-10" />
        </div>
      ))}
    </div>
  )
}

export interface IndexListProps {
  sites: SavedSite[]
  loading: boolean
  selectedKey: string | null
  sort: SortState | null
  maxOpens: number
  hasFilters: boolean
  query: string
  onSort: (key: SortKey) => void
  onSelect: (key: string) => void
  onOpen: (url: string) => void
  onClearFilters: () => void
  className?: string
}

/** Middle pane: sticky sortable header + dense rows. Scrolls on its own. */
export function IndexList({
  sites,
  loading,
  selectedKey,
  sort,
  maxOpens,
  hasFilters,
  query,
  onSort,
  onSelect,
  onOpen,
  onClearFilters,
  className,
}: IndexListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const density = useDensity(scrollRef)

  React.useEffect(() => {
    if (!selectedKey) return
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(selectedKey)}"]`
    )
    el?.scrollIntoView({ block: "nearest" })
  }, [selectedKey])

  return (
    <div ref={scrollRef} className={cn("overflow-y-auto", className)}>
      <div
        role="presentation"
        className="sticky top-0 z-10 bg-background pb-1 shadow-[0_1px_0_hsl(var(--separator))]"
      >
        <div className={cn(ROW_BOX, GRID[density], "h-9")}>
          <span />
          <HeaderCell label="Title" sortKey="title" sort={sort} onSort={onSort} />
          {density !== "compact" && (
            <HeaderCell label="Domain" sortKey="domain" sort={sort} onSort={onSort} />
          )}
          {density === "wide" && (
            <span className="truncate text-xs font-medium text-muted-foreground">Tags</span>
          )}
          <HeaderCell label="Opens" sortKey="opens" sort={sort} onSort={onSort} align="right" />
          <HeaderCell label="Saved" sortKey="saved" sort={sort} onSort={onSort} align="right" />
        </div>
      </div>

      {loading ? (
        <SkeletonRows density={density} />
      ) : sites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-[hsl(var(--surface-section))] text-muted-foreground">
            <SearchX className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-balance text-sm font-medium">
              {query.trim() ? `No sites match “${query.trim()}”` : "No sites here yet"}
            </p>
            <p className="text-balance text-sm text-muted-foreground">
              Try a different word, or look in another tag.
            </p>
          </div>
          {hasFilters && (
            <Button size="sm" className={CONTROL_BUTTON} onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div aria-label="Saved sites" className="pb-20">
          {sites.map((site) => {
            const key = siteKey(site)
            return (
              <Row
                key={key}
                site={site}
                density={density}
                selected={key === selectedKey}
                maxOpens={maxOpens}
                onSelect={onSelect}
                onOpen={onOpen}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
