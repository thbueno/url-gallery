import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

interface PinnedTagNavProps {
  pinnedTags: string[]
  activeTags: string[]
  onSelect: (tags: string[]) => void
  className?: string
}

const segmentVariants = cva(
  "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium outline-none transition-[background-color,color,box-shadow,border-color] duration-fast focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      state: {
        active: "border-border bg-surface-inner text-foreground shadow-xs",
        idle: "border-transparent text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { state: "idle" },
  }
)

/**
 * Fully rounded pill navbar: "All" plus one segment per pinned tag, in sidebar order.
 * Selecting a segment sets the tag filter to that tag; "All" (or re-clicking the active
 * segment) clears it. Several segments can show active when the sidebar's OR filter has
 * more than one tag selected. Scrolls sideways when the segments don't fit.
 */
export function PinnedTagNav({ pinnedTags, activeTags, onSelect, className }: PinnedTagNavProps) {
  return (
    <nav
      aria-label="Pinned tags"
      className={cn(
        "scrollbar-hide flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-border bg-surface-tertiary p-1.5",
        className
      )}
    >
      <button
        type="button"
        aria-current={activeTags.length === 0 ? "true" : undefined}
        onClick={() => onSelect([])}
        className={segmentVariants({ state: activeTags.length === 0 ? "active" : "idle" })}
      >
        All
      </button>
      {pinnedTags.map((tag) => {
        const active = activeTags.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(active ? [] : [tag])}
            className={segmentVariants({ state: active ? "active" : "idle" })}
          >
            {tag}
          </button>
        )
      })}
    </nav>
  )
}
