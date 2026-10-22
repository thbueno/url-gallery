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
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="search..."
        className="h-9 rounded-full pl-8 pr-8 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  )
}
