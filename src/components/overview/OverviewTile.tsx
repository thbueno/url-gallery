import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface OverviewTileProps {
  title: string
  /** Small note on the right of the header, e.g. "Top 5". */
  aside?: string
  children: ReactNode
  className?: string
}

/** Grey section tile with a heading and a white inner panel for its rows. Parents own placement. */
export function OverviewTile({ title, aside, children, className }: OverviewTileProps) {
  return (
    <section
      aria-label={title}
      className={cn("flex flex-col rounded-card bg-surface-section p-card-inset", className)}
    >
      <header className="flex items-baseline justify-between px-3 pb-2 pt-2">
        <h2 className="text-sm font-medium">{title}</h2>
        {aside ? <span className="text-xs text-muted-foreground">{aside}</span> : null}
      </header>
      <div className="flex flex-1 flex-col gap-0.5 rounded-inner bg-surface-inner p-1.5">
        {children}
      </div>
    </section>
  )
}
