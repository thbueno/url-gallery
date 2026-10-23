import { ChartNoAxesColumnIcon, LayoutGridIcon } from "lucide-react"

import { NavRow } from "@/components/gallery/NavRow"
import type { GalleryPage } from "@/hooks/useGalleryPage"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  page: GalleryPage
  /** Number shown next to "Gallery". */
  totalSites: number
  onPageChange: (page: GalleryPage) => void
  /** Icon-only rows for the collapsed sidebar. */
  compact?: boolean
  className?: string
}

/** The "Gallery" and "Overview" page links at the top of the sidebar. */
export function SidebarNav({
  page,
  totalSites,
  onPageChange,
  compact = false,
  className,
}: SidebarNavProps) {
  return (
    <nav aria-label="Pages" className={cn("flex flex-col gap-0.5", className)}>
      <NavRow
        compact={compact}
        active={page === "gallery"}
        icon={<LayoutGridIcon className="size-4" />}
        label="Gallery"
        count={totalSites}
        onClick={() => onPageChange("gallery")}
      />
      <NavRow
        compact={compact}
        active={page === "overview"}
        icon={<ChartNoAxesColumnIcon className="size-4" />}
        label="Overview"
        onClick={() => onPageChange("overview")}
      />
    </nav>
  )
}
