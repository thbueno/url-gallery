import { SearchIcon, XIcon } from "lucide-react"

import { SidebarIconButton } from "@/components/gallery/SidebarIconButton"
import { SidebarInput } from "@/components/gallery/SidebarInput"
import { cn } from "@/lib/utils"

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SearchBox({ value, onChange, className }: SearchBoxProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <SidebarInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onChange("")
        }}
        placeholder="Search sites"
        aria-label="Search sites"
        className="pl-8 pr-8"
      />
      {value && (
        <SidebarIconButton
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <XIcon />
        </SidebarIconButton>
      )}
    </div>
  )
}
