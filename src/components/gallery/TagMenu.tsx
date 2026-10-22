import { PlusIcon } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { UNCATEGORIZED } from "@/lib/categorizer"
import { normalizeTagName } from "@/lib/tags"
import { cn } from "@/lib/utils"

interface TagMenuProps {
  /** Tags this SavedSite has now. */
  current: string[]
  /** Every tag the menu offers as a checkbox. "Uncategorized" is automatic and never listed. */
  available: string[]
  /** Accessible name for the + button. */
  label: string
  onToggle: (tag: string) => void
  /** Called with a cleaned name when the user types a new tag and presses Enter. */
  onCreate: (name: string) => void
  className?: string
}

// Keys the menu itself needs for keyboard navigation; every other key belongs to the input.
const MENU_KEYS = new Set(["ArrowDown", "ArrowUp", "Escape", "Tab"])

/** Dashed "+" button that opens a checkbox list of tags plus a "New tag" input. */
export function TagMenu({
  current,
  available,
  label,
  onToggle,
  onCreate,
  className,
}: TagMenuProps) {
  const [draft, setDraft] = useState("")
  const known = available.filter((t) => t !== UNCATEGORIZED)

  function submit() {
    const name = normalizeTagName(draft, known)
    if (!name) return
    onCreate(name)
    setDraft("")
  }

  return (
    <DropdownMenu onOpenChange={(open) => open || setDraft("")}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-sm border border-dashed text-muted-foreground outline-none",
            "transition-[color,background-color,border-color,transform] duration-fast ease-out",
            "hover:border-border-hover hover:bg-surface-inner hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring active:scale-press",
            "data-[state=open]:border-solid data-[state=open]:bg-surface-inner data-[state=open]:text-foreground",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            className
          )}
        >
          <PlusIcon className="size-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" collisionPadding={8} className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Tags</DropdownMenuLabel>
        <div className="px-1 pb-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (!MENU_KEYS.has(e.key)) e.stopPropagation()
              if (e.key === "Enter") {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="New tag, then Enter"
            aria-label="New tag name"
            className="h-8 bg-surface-inner text-sm"
          />
        </div>
        <DropdownMenuSeparator />
        <div className="scrollbar-minimal max-h-56 overflow-y-auto">
          {known.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={current.includes(tag)}
              onCheckedChange={() => onToggle(tag)}
              onSelect={(e) => e.preventDefault()}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
