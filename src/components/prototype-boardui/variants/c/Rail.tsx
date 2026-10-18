import { LayoutList, Library, Tag } from "lucide-react"
import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { TagInfo } from "../../types"

/** "Dev Tools" -> "DT", "Design" -> "De": two characters keep tags starting with the same letter apart. */
function abbreviate(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1)
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
  const word = words[0] ?? ""
  return word.charAt(0).toUpperCase() + word.charAt(1).toLowerCase()
}

interface RailButtonProps {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}

function RailButton({ label, active, onClick, children }: RailButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-inner)] border text-sm font-medium tabular-nums transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
        active
          ? "border-border bg-[hsl(var(--surface-inner))] text-foreground shadow-[var(--shadow-xs)]"
          : "border-transparent text-muted-foreground hover:bg-[hsl(var(--surface-hover))] hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export interface RailProps {
  tags: TagInfo[]
  totalSites: number
  activeTag: string | null
  loading: boolean
  onSelectTag: (tag: string | null) => void
  className?: string
}

/** Narrow icon rail: "All" plus one letter button per tag (native title tooltips). */
export function Rail({ tags, totalSites, activeTag, loading, onSelectTag, className }: RailProps) {
  return (
    <nav
      aria-label="Tags"
      className={cn(
        "flex w-[3.25rem] shrink-0 flex-col items-center gap-1 rounded-card bg-[hsl(var(--surface-section))] p-1.5",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-inner)] bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-soft-foreground))]"
      >
        <Library className="size-4" />
      </div>
      <div aria-hidden="true" className="my-1 h-px w-5 bg-[hsl(var(--separator))]" />
      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto pb-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          Array.from({ length: 7 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
            <Skeleton key={i} className="size-10 shrink-0 rounded-[var(--radius-inner)]" />
          ))
        ) : (
          <>
            <RailButton
              label={`All sites · ${totalSites}`}
              active={activeTag === null}
              onClick={() => onSelectTag(null)}
            >
              <LayoutList className="size-4" />
            </RailButton>
            {tags.map((tag) => (
              <RailButton
                key={tag.name}
                label={`${tag.name} · ${tag.count}`}
                active={activeTag === tag.name}
                onClick={() => onSelectTag(tag.name)}
              >
                {abbreviate(tag.name) || <Tag className="size-4" />}
              </RailButton>
            ))}
          </>
        )}
      </div>
    </nav>
  )
}
