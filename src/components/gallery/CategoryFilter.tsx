import { InfoIcon, PinIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TagCount {
  name: string
  count: number
}

interface CategoryFilterProps {
  tags: TagCount[]
  activeTags: string[]
  pinnedTags: string[]
  totalCount: number
  onSelect: (tags: string[]) => void
  onTogglePinTag: (tag: string) => void
}

export function CategoryFilter({
  tags,
  activeTags,
  pinnedTags,
  totalCount,
  onSelect,
  onTogglePinTag,
}: CategoryFilterProps) {
  const uncategorizedCount = tags.find((c) => c.name === "Uncategorized")?.count ?? 0
  const showUncategorizedNotice = uncategorizedCount > 0 && totalCount > 0

  function toggleTag(name: string) {
    onSelect(activeTags.includes(name) ? [] : [name])
  }

  return (
    <nav className="flex flex-col gap-0.5 px-2 pb-4">
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Tags
      </p>

      <button
        type="button"
        onClick={() => onSelect([])}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
          activeTags.length === 0
            ? "bg-accent font-medium text-accent-foreground"
            : "text-sidebar-foreground hover:bg-accent/60"
        )}
      >
        <span>All</span>
        <span className="tabular-nums text-xs text-muted-foreground">{totalCount}</span>
      </button>

      {tags.map((tag) => (
        <div key={tag.name} className="group relative flex items-center">
          <button
            type="button"
            onClick={() => toggleTag(tag.name)}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
              activeTags.includes(tag.name)
                ? "bg-accent font-medium text-accent-foreground"
                : "text-sidebar-foreground hover:bg-accent/60"
            )}
          >
            <span className="min-w-0 truncate pr-5">{tag.name}</span>
            <span className="ml-2 shrink-0 tabular-nums text-xs text-muted-foreground">
              {tag.count}
            </span>
          </button>

          {/* Pin button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePinTag(tag.name)
            }}
            aria-label={pinnedTags.includes(tag.name) ? `Unpin ${tag.name}` : `Pin ${tag.name}`}
            className={cn(
              "absolute right-7 flex size-4 items-center justify-center rounded transition-opacity",
              pinnedTags.includes(tag.name)
                ? "opacity-100 text-foreground"
                : "opacity-0 group-hover:opacity-60 text-muted-foreground hover:!opacity-100"
            )}
          >
            <PinIcon size={10} className={cn(pinnedTags.includes(tag.name) && "fill-foreground")} />
          </button>
        </div>
      ))}

      {showUncategorizedNotice && (
        <div className="mt-3 flex items-start gap-1.5 rounded-md bg-muted/50 px-2 py-2">
          <InfoIcon size={11} className="mt-0.5 shrink-0 text-muted-foreground/70" />
          <p className="text-[10px] leading-snug text-muted-foreground">
            {uncategorizedCount === totalCount
              ? "All sites are uncategorized — tags are auto-detected from OG tags and domain."
              : `${uncategorizedCount} site${uncategorizedCount !== 1 ? "s" : ""} couldn't be auto-tagged.`}
          </p>
        </div>
      )}
    </nav>
  )
}
