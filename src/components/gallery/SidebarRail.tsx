import { SearchIcon } from "lucide-react"

import { NavRow } from "@/components/gallery/NavRow"
import { SidebarNav } from "@/components/gallery/SidebarNav"
import type { GalleryPage } from "@/hooks/useGalleryPage"
import { cn } from "@/lib/utils"

interface SidebarRailProps {
  page: GalleryPage
  totalSites: number
  onPageChange: (page: GalleryPage) => void
  /** Called when the search icon is clicked (usually expands the sidebar). */
  onSearch: () => void
  className?: string
}

/** Icon-only sidebar body for the collapsed state: search plus the page links. */
export function SidebarRail({
  page,
  totalSites,
  onPageChange,
  onSearch,
  className,
}: SidebarRailProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <NavRow compact label="Search" icon={<SearchIcon />} onClick={onSearch} />
      <SidebarNav compact page={page} totalSites={totalSites} onPageChange={onPageChange} />
    </div>
  )
}
