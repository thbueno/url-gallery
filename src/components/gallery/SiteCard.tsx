import { useEffect, useState } from "react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SiteCardProps {
  site: SavedSite
  onClick: (site: SavedSite) => void
  className?: string
}

function useBlobUrl(blob: Blob | null): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) return
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

export function SiteCard({ site, onClick, className }: SiteCardProps) {
  const thumbUrl = useBlobUrl(site.thumb)
  const domain = getDomain(site.url)

  return (
    <button
      type="button"
      onClick={() => onClick(site)}
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-card",
        "aspect-[4/3] border border-border bg-muted",
        "transition-all duration-200",
        "hover:scale-[1.02] hover:ring-2 hover:ring-[hsl(var(--card-hover-ring))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "text-left",
        className
      )}
    >
      {/* Thumbnail or fallback */}
      {thumbUrl ? (
        <img src={thumbUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {site.favicon ? (
            <img src={site.favicon} alt="" className="h-10 w-10 opacity-50" />
          ) : (
            <span className="select-none text-2xl font-semibold text-muted-foreground/30">
              {domain[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      )}

      {/* Bottom scrim + metadata */}
      <div
        className="absolute inset-x-0 bottom-0 p-2.5"
        style={{ background: "var(--thumb-scrim)" }}
      >
        <p className="truncate text-xs font-medium leading-tight text-white">{site.title}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[10px] text-white/60">{domain}</span>
          <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] leading-none text-white/80">
            {site.category}
          </span>
        </div>
      </div>
    </button>
  )
}
