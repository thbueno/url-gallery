import { cn } from "@/lib/utils"

interface PinnedTagChipsProps {
  pinnedTags: string[]
  activeTags: string[]
  onSelect: (tags: string[]) => void
  className?: string
}

const CHIP_BASE = "shrink-0 rounded-full px-4 py-2 text-sm transition-colors"
const CHIP_ACTIVE = "bg-foreground font-medium text-background"
const CHIP_IDLE = "text-muted-foreground hover:text-foreground"

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
        "scrollbar-hide flex min-w-0 max-w-xl shrink-0 items-center gap-1.5 overflow-x-auto rounded-full border border-border bg-background p-1.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSelect([])}
        className={cn(CHIP_BASE, activeTags.length === 0 ? CHIP_ACTIVE : CHIP_IDLE)}
      >
        All
      </button>
      {pinnedTags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(activeTags.includes(tag) ? [] : [tag])}
          className={cn(CHIP_BASE, activeTags.includes(tag) ? CHIP_ACTIVE : CHIP_IDLE)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
