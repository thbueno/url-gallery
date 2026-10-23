import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Placeholder shaped like the Overview page, shown while the numbers load. */
export function OverviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)} aria-busy="true">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton list
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    </div>
  )
}
