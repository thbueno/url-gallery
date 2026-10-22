import { SearchIcon, XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
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
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onChange("")
        }}
        placeholder="Search sites"
        aria-label="Search sites"
        className="h-9 rounded-inner border-border bg-surface-inner pl-8 pr-8 text-sm shadow-xs transition-[border-color,box-shadow] duration-150 ease-out hover:border-border-hover focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
}
