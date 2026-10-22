import { cn } from "@/lib/utils"

interface GalleryHeaderProps {
  /** Left slot, e.g. the search box. */
  start?: React.ReactNode
  /** Centered slot, e.g. pinned-tag chips or the bulk-action bar. */
  center?: React.ReactNode
  /** Right slot, e.g. the select-mode toggle. Balances the width of the left slot. */
  end?: React.ReactNode
  /** Sizing for the right slot; the parent keeps it in sync with the left slot's width. */
  endClassName?: string
  className?: string
}

export function GalleryHeader({ start, center, end, endClassName, className }: GalleryHeaderProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2 px-4 py-3.5", className)}>
      {start}
      <div className="flex flex-1 justify-center">{center}</div>
      <div className={cn("flex justify-end", endClassName)}>{end}</div>
    </div>
  )
}
