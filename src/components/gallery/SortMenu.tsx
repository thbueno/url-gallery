import { ChevronsUpDownIcon } from "lucide-react"

import { headerButtonVariants } from "@/components/gallery/header-button"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SORT_OPTIONS, type SortOrder } from "@/lib/sort-sites"
import { cn } from "@/lib/utils"

interface SortMenuProps {
  value: SortOrder
  onChange: (order: SortOrder) => void
  className?: string
}

/** "Sort: Recently saved" dropdown. The "Sort" word hides below 900px of window width. */
export function SortMenu({ value, onChange, className }: SortMenuProps) {
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Sort: ${label}`}
          className={cn(headerButtonVariants(), className)}
        >
          <span className="text-muted-foreground max-[899px]:sr-only">Sort</span>
          {label}
          <ChevronsUpDownIcon className="text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as SortOrder)}>
          {SORT_OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
