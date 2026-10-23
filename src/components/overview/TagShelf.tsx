import { ArrowRightIcon } from "lucide-react"

import { SiteCard } from "@/components/gallery/SiteCard"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface TagShelfProps {
  tag: string
  /** Sites with this tag in total, which can exceed the cards shown. */
  total: number
  sites: SavedSite[]
  onOpen: (site: SavedSite) => void
  onSeeAll: (tag: string) => void
  className?: string
}

/** One Tag's sites in a horizontal, scroll-snapping row with a "See all" link to the gallery. */
export function TagShelf({ tag, total, sites, onOpen, onSeeAll, className }: TagShelfProps) {
  return (
    <section aria-label={tag} className={cn("flex flex-col gap-3", className)}>
      <header className="flex items-baseline justify-between px-1">
        <h2 className="text-base font-medium tracking-tight">
          {tag} <span className="text-sm text-muted-foreground tabular-nums">{total}</span>
        </h2>
        <button
          type="button"
          onClick={() => onSeeAll(tag)}
          className="flex items-center gap-1 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          See all
          <ArrowRightIcon className="size-3.5" aria-hidden="true" />
        </button>
      </header>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {sites.map((site) => (
          <SiteCard
            key={site.id ?? site.url}
            site={site}
            onClick={onOpen}
            className="w-64 shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  )
}
