import { Inbox, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { INNER, SECTION } from "./shared"

const tile = cn("rounded-card", SECTION)
const sk = "animate-pulse bg-[hsl(var(--surface-tertiary))]"

export function BentoSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className={cn("h-80 rounded-card md:col-span-2 xl:row-span-2 xl:h-auto", sk)} />
        <Skeleton className={cn("h-72 rounded-card xl:row-span-2 xl:h-auto", sk)} />
        <Skeleton className={cn("h-72 rounded-card xl:row-span-2 xl:h-auto", sk)} />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className={cn("h-32 rounded-card", sk)} />
        ))}
      </div>
      <div>
        <Skeleton className={cn("mb-3 h-6 w-32 rounded-sm", sk)} />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={cn("h-52 w-60 shrink-0 rounded-card", sk)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4" aria-busy="true">
      {Array.from({ length: 8 }, (_, i) => i).map((i) => (
        <Skeleton key={i} className={cn("h-52 rounded-card", sk)} />
      ))}
    </div>
  )
}

export function EmptyState({
  query,
  tag,
  noSites,
  onClear,
}: {
  query: string
  tag: string | null
  noSites: boolean
  onClear: () => void
}) {
  const Icon = noSites ? Inbox : SearchX
  return (
    <div className={cn("flex flex-col items-center px-6 py-20 text-center", tile)}>
      <span
        className={cn(
          "grid size-12 place-items-center rounded-lg text-muted-foreground shadow-[var(--shadow-sm)]",
          INNER
        )}
      >
        <Icon className="size-5" />
      </span>
      <h2 className="mt-5 max-w-md text-lg font-semibold tracking-tight text-balance">
        {noSites
          ? "Nothing saved yet"
          : query
            ? `No sites match “${query}”`
            : `No sites in ${tag ?? "this view"}`}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground text-balance">
        {noSites
          ? "Save a site from the toolbar popup and it will show up here."
          : "Try a different spelling, a shorter search, or another tag."}
      </p>
      {noSites ? null : (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="mt-5 border-border bg-[hsl(var(--surface-inner))] shadow-[var(--shadow-xs)] transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
