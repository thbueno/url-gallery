import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { UNCATEGORIZED } from "../../editState"
import { TAG_HUES, type TagHue } from "../../theme"

/** Stable hash of the tag name -> one of the three BoardUI hues. */
export function tagHue(name: string): TagHue {
  let h = 5381
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0
  return TAG_HUES[h % TAG_HUES.length] ?? "blue"
}

// Full class strings (Tailwind can't see interpolated names). Colours come from --tag-* tokens.
const CHIP: Record<TagHue | "neutral", string> = {
  blue: "bg-[hsl(var(--tag-blue-bg))] text-[hsl(var(--tag-blue-fg))]",
  green: "bg-[hsl(var(--tag-green-bg))] text-[hsl(var(--tag-green-fg))]",
  purple: "bg-[hsl(var(--tag-purple-bg))] text-[hsl(var(--tag-purple-fg))]",
  neutral: "bg-[hsl(var(--surface-tertiary))] text-muted-foreground",
}

const DOT: Record<TagHue | "neutral", string> = {
  blue: "bg-[hsl(var(--tag-blue-fg))]",
  green: "bg-[hsl(var(--tag-green-fg))]",
  purple: "bg-[hsl(var(--tag-purple-fg))]",
  neutral: "bg-muted-foreground",
}

function hueOf(name: string): TagHue | "neutral" {
  return name === UNCATEGORIZED ? "neutral" : tagHue(name)
}

/** Small colour dot for a tag (sidebar rows, navbar). */
export function TagDot({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", DOT[hueOf(name)], className)}
    />
  )
}

export interface TagChipProps {
  name: string
  /** When set, the chip shows a remove button (x). */
  onRemove?: () => void
  className?: string
}

/** BoardUI status-chip: soft tinted fill + darker text. Parents own placement. */
export function TagChip({ name, onRemove, className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-sm py-0.5 pr-1 pl-1.5 text-[0.6875rem] leading-none font-medium",
        onRemove ? "" : "pr-1.5",
        CHIP[hueOf(name)],
        className
      )}
    >
      <span className="truncate">{name}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove tag ${name}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="-my-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm opacity-60 outline-none transition-[opacity,background-color,transform] duration-150 ease-out hover:bg-current/15 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.9]"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  )
}
