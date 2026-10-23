import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface StatTileProps {
  label: string
  value: number
  /** Short note under the number. */
  caption?: string
  icon?: ReactNode
  className?: string
}

/** One headline number. Parents own placement and size. */
export function StatTile({ label, value, caption, icon, className }: StatTileProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-card bg-surface-section p-5", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon ? (
          <span className="flex size-7 items-center justify-center rounded-sm bg-surface-inner shadow-xs [&_svg]:size-3.5">
            {icon}
          </span>
        ) : null}
        {label}
      </div>
      <div className="text-3xl font-semibold leading-none tracking-tight tabular-nums">
        {value.toLocaleString("en-US")}
      </div>
      {caption ? <p className="truncate text-xs text-muted-foreground">{caption}</p> : null}
    </div>
  )
}
