import { ChevronsUpDownIcon } from "lucide-react"

import { HeaderButton } from "@/components/gallery/HeaderButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SORT_OPTIONS, type SortOrder, isSortOrder } from "@/lib/sort-sites"

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
        <HeaderButton aria-label={`Sort: ${label}`} className={className}>
          <span className="text-muted-foreground narrow:sr-only">Sort</span>
          {label}
          <ChevronsUpDownIcon className="text-muted-foreground" aria-hidden="true" />
        </HeaderButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => isSortOrder(v) && onChange(v)}>
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
