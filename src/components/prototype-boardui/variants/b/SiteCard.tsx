import { ArrowUpRight, Pin } from "lucide-react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { Favicon, SiteThumb } from "../../atoms"
import { getDomain, timeAgo } from "../../helpers"
import { INNER, R_INNER, SECTION, plural } from "./shared"

export interface SiteCardProps {
  site: SavedSite
  onOpen: (url: string) => void
  className?: string
}

/** Compact card: grey section, thumbnail inset by 6px with a concentric inner radius. */
export function SiteCard({ site, onOpen, className }: SiteCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(site.url)}
      className={cn(
        "group/card flex min-w-0 flex-col rounded-card p-1.5 text-left outline-none",
        "transition-[background-color,transform] duration-200 ease-out",
        "hover:bg-[hsl(var(--surface-tertiary))] active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        SECTION,
        className
      )}
    >
      <div className="relative">
        <SiteThumb site={site} className={R_INNER} />
        {site.pinned ? (
          <span
            className={cn(
              "absolute top-2 left-2 grid size-6 place-items-center rounded-sm text-muted-foreground shadow-[var(--shadow-xs)]",
              INNER
            )}
          >
            <Pin className="size-3" />
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-2 right-2 grid size-7 translate-y-1 place-items-center rounded-md opacity-0 shadow-[var(--shadow-sm)]",
            "transition-[opacity,transform] duration-200 ease-out",
            "group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100",
            INNER
          )}
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1 px-2 pt-2.5 pb-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <Favicon site={site} size="xs" />
          <span className="truncate text-sm font-medium tracking-tight">{site.title}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground tabular-nums">
          <span className="truncate">{getDomain(site.url)}</span>
          <span className="shrink-0">
            {site.openCount > 0 ? plural(site.openCount, "open") : timeAgo(site.savedAt)}
          </span>
        </div>
      </div>
    </button>
  )
}
