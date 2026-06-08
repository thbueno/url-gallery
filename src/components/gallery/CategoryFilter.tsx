import { InfoIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CategoryCount {
  name: string
  count: number
}

interface CategoryFilterProps {
  categories: CategoryCount[]
  activeCategory: string | null
  totalCount: number
  onSelect: (category: string | null) => void
}

export function CategoryFilter({
  categories,
  activeCategory,
  totalCount,
  onSelect,
}: CategoryFilterProps) {
  const uncategorizedCount = categories.find((c) => c.name === "Uncategorized")?.count ?? 0
  const showUncategorizedNotice = uncategorizedCount > 0 && totalCount > 0

  return (
    <nav className="flex flex-col gap-0.5 px-2 pb-4">
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Categories
      </p>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
          activeCategory === null
            ? "bg-accent font-medium text-accent-foreground"
            : "text-sidebar-foreground hover:bg-accent/60"
        )}
      >
        <span>All</span>
        <span className="tabular-nums text-xs text-muted-foreground">{totalCount}</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.name}
          type="button"
          onClick={() => onSelect(cat.name === activeCategory ? null : cat.name)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
            activeCategory === cat.name
              ? "bg-accent font-medium text-accent-foreground"
              : "text-sidebar-foreground hover:bg-accent/60"
          )}
        >
          <span className="truncate">{cat.name}</span>
          <span className="ml-2 shrink-0 tabular-nums text-xs text-muted-foreground">
            {cat.count}
          </span>
        </button>
      ))}

      {showUncategorizedNotice && (
        <div className="mt-3 flex items-start gap-1.5 rounded-md bg-muted/50 px-2 py-2">
          <InfoIcon size={11} className="mt-0.5 shrink-0 text-muted-foreground/70" />
          <p className="text-[10px] leading-snug text-muted-foreground">
            {uncategorizedCount === totalCount
              ? "All sites are uncategorized — categories are auto-detected from OG tags and domain."
              : `${uncategorizedCount} site${uncategorizedCount !== 1 ? "s" : ""} couldn't be auto-categorized.`}
          </p>
        </div>
      )}
    </nav>
  )
}
