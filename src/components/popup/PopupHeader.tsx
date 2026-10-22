import { LayoutGrid } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PopupHeaderProps {
  /** Show the neutral "Full thumbnails" chip (host permission granted). */
  fullThumbnails: boolean
  onOpenGallery: () => void
  className?: string
}

/** Popup title row: name, optional "Full thumbnails" chip, and the open-gallery icon button. */
export function PopupHeader({ fullThumbnails, onOpenGallery, className }: PopupHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-[length:var(--text-sm)] font-semibold tracking-tight">URL Gallery</span>
      <div className="flex items-center gap-1.5">
        {fullThumbnails && <Badge variant="tag">Full thumbnails</Badge>}
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          onClick={onOpenGallery}
          aria-label="Open gallery"
        >
          <LayoutGrid aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
