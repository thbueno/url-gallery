import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

interface PinnedTagChipsProps {
  pinnedTags: string[]
  activeTags: string[]
  onSelect: (tags: string[]) => void
  className?: string
}

const chipVariants = cva("shrink-0 rounded-full px-4 py-2 text-sm transition-colors", {
  variants: {
    state: {
      active: "bg-foreground font-medium text-background",
      idle: "text-muted-foreground hover:text-foreground",
    },
  },
  defaultVariants: { state: "idle" },
})

/** "All" plus one chip per pinned tag. Clicking the active chip clears the filter. */
export function PinnedTagChips({
  pinnedTags,
  activeTags,
  onSelect,
  className,
}: PinnedTagChipsProps) {
  return (
    <div
      className={cn(
        "scrollbar-hide flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-full border border-border bg-background p-1.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSelect([])}
        className={chipVariants({ state: activeTags.length === 0 ? "active" : "idle" })}
      >
        All
      </button>
      {pinnedTags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(activeTags.includes(tag) ? [] : [tag])}
          className={chipVariants({ state: activeTags.includes(tag) ? "active" : "idle" })}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
