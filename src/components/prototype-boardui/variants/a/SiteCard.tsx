import { Pin } from "lucide-react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Favicon } from "../../atoms"
import { getDomain, timeAgo } from "../../helpers"
import { Thumb } from "./Thumb"

export interface SiteCardProps {
  site: SavedSite
  onOpen: (url: string) => void
  /** "feature" = larger pinned-strip card; "grid" = standard gallery card. */
  size?: "feature" | "grid"
  className?: string
}

/**
 * Grey section card (no border, no shadow) with the thumbnail inset by 6px.
 * Concentric radii: thumb = card radius - inset, via --radius-inner (= 1.5r - 6px).
 */
export function SiteCard({ site, onOpen, size = "grid", className }: SiteCardProps) {
  const feature = size === "feature"
  const domain = getDomain(site.url)
  const firstTag = site.tags[0]

  return (
    <button
      type="button"
      onClick={() => onOpen(site.url)}
      title={site.title}
      className={cn(
        "group flex w-full flex-col rounded-card bg-[hsl(var(--surface-section))] p-1.5 text-left",
        "transition-[background-color,transform] duration-200 ease-out active:scale-[0.98]",
        "hover:bg-[hsl(var(--surface-tertiary))]",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className
      )}
    >
      <div className="relative">
        <Thumb
          site={site}
          className={cn(
            "rounded-[var(--radius-inner)] shadow-[var(--shadow-card)]",
            "transition-[transform,box-shadow] duration-200 ease-out",
            "group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-md)]",
            "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          )}
        />
        {site.pinned ? (
          <span
            aria-label="Pinned"
            className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-md bg-[hsl(var(--surface-inner)/0.9)] text-muted-foreground shadow-[var(--shadow-xs)] backdrop-blur-sm"
          >
            <Pin className="size-3" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className={cn("flex flex-col gap-1.5 px-2 pt-2.5 pb-2", feature && "gap-2 pt-3 pb-2.5")}>
        <h3
          className={cn(
            "truncate font-medium leading-snug tracking-[-0.01em] text-foreground",
            feature ? "text-base" : "text-sm"
          )}
        >
          {site.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Favicon site={site} size="xs" />
          <span className="min-w-0 flex-1 truncate">{domain}</span>
          {feature && firstTag ? (
            <span className="shrink-0 rounded-sm bg-[hsl(var(--surface-inner))] px-1.5 py-0.5 text-[0.6875rem] font-medium leading-none text-muted-foreground shadow-[var(--shadow-2xs)]">
              {firstTag}
            </span>
          ) : null}
          <span className="shrink-0 tabular-nums">{timeAgo(site.savedAt)}</span>
        </div>
      </div>
    </button>
  )
}
