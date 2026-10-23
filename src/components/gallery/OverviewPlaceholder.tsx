import { ChartNoAxesColumnIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Stand-in for the Overview page until it lands. */
export function OverviewPlaceholder({ className }: { className?: string }) {
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
      <h2 className="text-base font-medium tracking-tight">Overview is coming soon</h2>
      <p className="max-w-xs text-pretty text-sm text-muted-foreground">
        Stats and your most-opened sites will live here.
      </p>
    </div>
  )
}
