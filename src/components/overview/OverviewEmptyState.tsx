import { ChartNoAxesColumnIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Shown on the Overview page when nothing is saved yet. */
export function OverviewEmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card bg-surface-section px-6 py-20 text-center",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-surface-inner text-muted-foreground shadow-sm">
        <ChartNoAxesColumnIcon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-medium tracking-tight">Nothing to show yet</h2>
      <p className="max-w-xs text-pretty text-sm text-muted-foreground">
        Save a site from the toolbar button and your stats and shelves will appear here.
      </p>
    </div>
  )
}
