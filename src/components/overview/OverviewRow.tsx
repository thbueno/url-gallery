import { Favicon } from "@/components/gallery/Favicon"
import { getDomain } from "@/lib/format"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OverviewRowProps {
  site: SavedSite
  onOpen: (site: SavedSite) => void
  /** Rank number shown before the icon (ranked lists only). */
  rank?: number
  /** Bar length from 0 to 1, relative to the top site. Shows the bar and Open count. */
  share?: number
  /** Right-hand text when there is no bar, e.g. "3d ago". */
  trailing?: string
  className?: string
}

/** One clickable site row for the Most opened and Recently saved lists. */
export function OverviewRow({ site, onOpen, rank, share, trailing, className }: OverviewRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(site)}
      title={site.title}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none",
        "transition-colors duration-fast ease-out hover:bg-surface-hover motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {rank !== undefined ? (
        <span className="w-4 text-xs text-muted-foreground tabular-nums">{rank}</span>
      ) : null}
      <Favicon site={site} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium">{site.title}</span>
        {share !== undefined ? (
          <span className="block h-1 overflow-hidden rounded-sm bg-surface-tertiary">
            <span
              className="block h-full rounded-sm bg-primary"
              style={{ width: `${Math.round(share * 100)}%` }}
            />
          </span>
        ) : (
          <span className="truncate text-xs text-muted-foreground">{getDomain(site.url)}</span>
        )}
      </span>
      <span
        className={cn(
          "shrink-0 text-right tabular-nums",
          share !== undefined ? "text-sm font-medium" : "text-xs text-muted-foreground"
        )}
      >
        {share !== undefined ? site.openCount.toLocaleString("en-US") : trailing}
      </span>
    </button>
  )
}
