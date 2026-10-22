import { cn } from "@/lib/utils"

interface GalleryHeaderProps {
  /** Left slot, e.g. the sort menu. */
  start?: React.ReactNode
  /** Centre slot (pinned-tag navbar, or the bulk-action bar in select mode). */
  center?: React.ReactNode
  /** Right slot, e.g. the select-mode toggle. */
  end?: React.ReactNode
  className?: string
}

/**
 * One row at 1200px of window width or more, with the centre slot truly centred. Below that the
 * centre slot drops to its own centred row so nothing can collide.
 */
export function GalleryHeader({ start, center, end, className }: GalleryHeaderProps) {
  return (
    <header
      className={cn(
        "grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3",
        "wide:grid-cols-[minmax(0,1fr)_minmax(0,max-content)_minmax(0,1fr)] wide:gap-x-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 wide:col-start-1 wide:row-start-1">
        {start}
      </div>
      <div className="col-span-2 row-start-2 flex min-w-0 justify-center empty:hidden wide:col-span-1 wide:col-start-2 wide:row-start-1">
        {center}
      </div>
      <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-2 wide:col-start-3">
        {end}
      </div>
    </header>
  )
}
