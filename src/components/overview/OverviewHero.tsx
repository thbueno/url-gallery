import { FlameIcon } from "lucide-react"

import { Favicon } from "@/components/gallery/Favicon"
import { SiteThumbnail } from "@/components/gallery/SiteThumbnail"
import { getDomain, timeAgo } from "@/lib/format"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OverviewHeroProps {
  site: SavedSite
  onOpen: (site: SavedSite) => void
  className?: string
}

/** Big tile for the most-opened site. Parents own placement and size. */
export function OverviewHero({ site, onOpen, className }: OverviewHeroProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(site)}
      title={site.title}
      className={cn(
        "flex flex-col gap-3 rounded-card bg-surface-section p-card-inset text-left outline-none",
        "transition-colors duration-base ease-out hover:bg-surface-tertiary motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="relative">
        <SiteThumbnail site={site} className="rounded-inner" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-surface-inner px-2 py-1 text-xs font-medium shadow-xs">
          <FlameIcon className="size-3.5 text-primary" aria-hidden="true" />
          Most opened
        </span>
      </div>
      <div className="flex items-end justify-between gap-4 px-3 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Favicon site={site} />
            <h2 className="truncate text-xl font-semibold tracking-tight">{site.title}</h2>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {getDomain(site.url)} · Saved {timeAgo(site.savedAt)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-3xl font-semibold leading-none tracking-tight tabular-nums">
            {site.openCount.toLocaleString("en-US")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">opens</div>
        </div>
      </div>
    </button>
  )
}
