import { Plus } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { normalizeTagName } from "../../editState"
import { TagDot } from "./TagChip"

/** Typing a new tag name + Enter. Keys are stopped so the menu's type-ahead doesn't steal them. */
export function NewTagInput({
  known,
  onCreate,
  className,
}: {
  known: string[]
  onCreate: (name: string) => void
  className?: string
}) {
  const [value, setValue] = useState("")
  const name = normalizeTagName(value, known)
  const submit = () => {
    if (!name) return
    onCreate(name)
    setValue("")
  }
  return (
    <div className={cn("px-1 pb-1", className)}>
      <div className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-[hsl(var(--surface-inner))] px-2 shadow-[var(--shadow-xs)] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        <Plus className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="New tag, then Enter"
          aria-label="New tag name"
          className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}

/** Dropdown body for one card: toggle existing tags, or create a new one. */
export function CardTagMenuBody({
  available,
  current,
  onToggle,
  onAdd,
}: {
  available: string[]
  current: string[]
  onToggle: (tag: string) => void
  onAdd: (tag: string) => void
}) {
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">Tags</DropdownMenuLabel>
      <NewTagInput known={available} onCreate={onAdd} />
      <DropdownMenuSeparator />
      <div className="scrollbar-minimal max-h-56 overflow-y-auto">
        {available.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag}
            checked={current.includes(tag)}
            onCheckedChange={() => onToggle(tag)}
            onSelect={(e) => e.preventDefault()}
          >
            <TagDot name={tag} className="mr-2" />
            {tag}
          </DropdownMenuCheckboxItem>
        ))}
      </div>
    </>
  )
}

/** Dropdown body for bulk "Add tag": pick one tag, or type a new one. Closes after picking. */
export function BulkAddMenuBody({
  available,
  onAdd,
}: { available: string[]; onAdd: (tag: string) => void }) {
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">
        Add tag to selected
      </DropdownMenuLabel>
      <NewTagInput known={available} onCreate={onAdd} />
      <DropdownMenuSeparator />
      <div className="scrollbar-minimal max-h-56 overflow-y-auto">
        {available.map((tag) => (
          <DropdownMenuItem key={tag} onSelect={() => onAdd(tag)}>
            <TagDot name={tag} className="mr-2" />
            {tag}
          </DropdownMenuItem>
        ))}
      </div>
    </>
  )
}
