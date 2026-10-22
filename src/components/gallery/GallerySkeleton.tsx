import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface GallerySkeletonProps {
  /** Column count; falls back to 4 until the container has been measured. */
  cols: number
  className?: string
}

/** Placeholder card grid shown while sites load or before the first width measurement. */
export function GallerySkeleton({ cols, className }: GallerySkeletonProps) {
  return (
    <div
      className={cn("grid gap-6", className)}
      style={{ gridTemplateColumns: `repeat(${cols || 4}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: (cols || 4) * 3 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton list
        <Skeleton key={i} className="aspect-[4/5] rounded-card" />
      ))}
    </div>
  )
}
