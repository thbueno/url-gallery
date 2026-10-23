import type { ComponentProps } from "react"

import { CategoryFilter } from "@/components/gallery/CategoryFilter"
import { cn } from "@/lib/utils"

type TagListProps = ComponentProps<typeof CategoryFilter> & {
  className?: string
}

/** Scrollable tag list for the sidebar body. */
export function TagList({ className, ...filterProps }: TagListProps) {
  return (
    <div className={cn("scrollbar-minimal flex flex-col overflow-y-auto", className)}>
      <CategoryFilter {...filterProps} />
    </div>
  )
}
