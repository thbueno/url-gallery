import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagChipProps {
  name: string
  /** When set, the chip shows a remove (x) button. */
  onRemove?: () => void
  className?: string
}

/** One neutral tag chip (ADR 0010). Parents own placement. */
export function TagChip({ name, onRemove, className }: TagChipProps) {
  return (
    <Badge
      variant="tag"
      className={cn("min-w-0 max-w-full gap-1", onRemove && "pr-1.5", className)}
    >
      <span className="truncate">{name}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove tag ${name}`}
          onClick={onRemove}
          className={cn(
            "-my-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm opacity-60 outline-none",
            "transition-[opacity,background-color,transform] duration-fast ease-out",
            "hover:bg-foreground/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
            "active:scale-press motion-reduce:transition-none motion-reduce:active:scale-100"
          )}
        >
          <XIcon className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </Badge>
  )
}
