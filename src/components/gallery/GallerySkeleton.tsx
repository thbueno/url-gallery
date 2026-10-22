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
        <div key={i} className="rounded-card bg-surface-section p-card-inset">
          <Skeleton className="aspect-thumb rounded-inner" />
          <div className="flex flex-col gap-2 px-2 pb-2 pt-3">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-1 h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
