import { useEffect, useState } from "react"

import { Favicon } from "@/components/gallery/Favicon"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SiteThumbnailProps {
  site: SavedSite
  /** Parent owns the radius and any lift or shadow, e.g. "rounded-inner shadow-2xs". */
  className?: string
}

function useBlobUrl(blob: Blob | null): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) {
      setUrl(undefined)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

/**
 * Thumbnail image, falling back to the favicon on a quiet plate, then to a letter mark
 * (the favicon component draws the letter). The radius comes from the parent and the
 * image inherits it.
 */
export function SiteThumbnail({ site, className }: SiteThumbnailProps) {
  const url = useBlobUrl(site.thumb)

  return (
    <div
      className={cn(
        "relative isolate aspect-thumb w-full overflow-hidden bg-surface-tertiary",
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
        <div className="flex size-full items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-xl bg-surface-inner shadow-sm">
            <Favicon site={site} size="lg" />
          </div>
        </div>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-outline"
      />
    </div>
  )
}
