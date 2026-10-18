import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Favicon, useThumbUrl } from "../../atoms"

export interface ThumbProps {
  site: SavedSite
  /** Parent owns size + radius, e.g. "aspect-[16/10] rounded-[var(--radius-inner)]". */
  className?: string
}

/**
 * Atelier thumbnail. With a blob: the image. Without: a quiet plate holding the favicon on a
 * small raised tile, so a gallery of zero thumbnails still reads as designed, not empty.
 */
export function Thumb({ site, className }: ThumbProps) {
  const url = useThumbUrl(site.thumb)
  return (
    <div
      className={cn(
        "relative isolate aspect-[16/10] w-full overflow-hidden bg-[hsl(var(--surface-tertiary))]",
        className
      )}
    >
      {url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          className="size-full rounded-[inherit] object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-[radial-gradient(120%_90%_at_50%_0%,hsl(var(--surface-inner)/0.7),transparent_70%)]">
          <div className="flex size-[3.75rem] items-center justify-center rounded-xl bg-[hsl(var(--surface-inner))] p-1.5 shadow-[var(--shadow-sm)]">
            <Favicon site={site} size="xl" />
          </div>
        </div>
      )}
      {/* image outline: 1px inset at low alpha, above the image */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.07)]"
      />
    </div>
  )
}
