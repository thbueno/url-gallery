import { cn } from "@/lib/utils"
import { TagDot } from "./TagChip"

export interface TopNavProps {
  /** Pinned tag names, in order. "All" is always first. */
  pinnedTags: string[]
  /** null = All. */
  activeTag: string | null
  onTagChange: (tag: string | null) => void
  className?: string
}

const item = [
  "relative flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[max(0px,calc(var(--radius)-2px))] border border-transparent px-3 text-sm font-medium outline-none",
  "transition-[background-color,color,box-shadow,border-color,transform] duration-150 ease-out active:scale-[0.98]",
  "focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100",
]

/**
 * Top-centre navbar built from the tags pinned in the sidebar (mirrors the real gallery's pinned
 * chips). BoardUI segmented control: grey track, active = surface chip + 1px border + shadow-xs.
 */
export function TopNav({ pinnedTags, activeTag, onTagChange, className }: TopNavProps) {
  const entries: { key: string | null; label: string }[] = [
    { key: null, label: "All" },
    ...pinnedTags.map((t) => ({ key: t, label: t })),
  ]
  return (
    <nav
      aria-label="Pinned tags"
      className={cn(
        "scrollbar-hide flex min-w-0 max-w-full items-center gap-0.5 overflow-x-auto rounded-[var(--radius)] bg-[hsl(var(--surface-tertiary))] p-0.5",
        className
      )}
    >
      {entries.map((e) => {
        const active = activeTag === e.key
        return (
          <button
            key={e.key ?? "__all"}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onTagChange(e.key)}
            className={cn(
              item,
              active
                ? "border-border bg-[hsl(var(--surface-inner))] text-foreground shadow-[var(--shadow-xs)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {e.key !== null ? <TagDot name={e.key} /> : null}
            {e.label}
          </button>
        )
      })}
    </nav>
  )
}
