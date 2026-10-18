import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { SiteCard } from "./SiteCard"
import { INNER } from "./shared"

const arrowBtn = cn(
  "grid size-8 place-items-center rounded-md border border-border text-muted-foreground shadow-[var(--shadow-xs)] outline-none",
  "transition-[color,background-color,transform,opacity] duration-150 ease-out",
  "hover:bg-[hsl(var(--surface-hover))] hover:text-foreground active:scale-[0.98]",
  "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
  INNER
)

export interface ShelfProps {
  title: string
  sites: SavedSite[]
  onOpen: (url: string) => void
  onSeeAll: () => void
  className?: string
}

/** One tag as a horizontal scroll-snap row of compact cards. */
export function Shelf({ title, sites, onOpen, onSeeAll, className }: ShelfProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [edge, setEdge] = React.useState({ start: true, end: true })

  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdge({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    })
  }, [])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <section aria-label={title} className={className}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-lg font-semibold tracking-tight text-balance">{title}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">{sites.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSeeAll}
            className="group/see mr-1 flex items-center gap-1 rounded-sm px-1 text-sm font-medium text-muted-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            See all
            <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover/see:translate-x-0.5" />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} back`}
            disabled={edge.start}
            onClick={() => scrollBy(-1)}
            className={arrowBtn}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} forward`}
            disabled={edge.end}
            onClick={() => scrollBy(1)}
            className={arrowBtn}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        onScroll={measure}
        className={cn(
          "-mx-1.5 flex snap-x snap-mandatory scroll-px-1.5 gap-4 overflow-x-auto px-1.5 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // soft fade where more cards continue
          !edge.end &&
            !edge.start &&
            "[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-3rem),transparent)]",
          !edge.end &&
            edge.start &&
            "[mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]",
          edge.end && !edge.start && "[mask-image:linear-gradient(to_right,transparent,black_2rem)]"
        )}
      >
        {sites.map((s) => (
          <SiteCard
            key={s.id ?? s.url}
            site={s}
            onOpen={onOpen}
            className="w-60 shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  )
}
