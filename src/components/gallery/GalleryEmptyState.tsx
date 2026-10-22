import { BookmarkIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface GalleryEmptyStateProps {
  searchQuery: string
  activeTags: string[]
  onClearSearch: () => void
  className?: string
}

/** Shown when there are no sites to display: no search results, empty tag, or nothing saved. */
export function GalleryEmptyState({
  searchQuery,
  activeTags,
  onClearSearch,
  className,
}: GalleryEmptyStateProps) {
  return (
    <div
      className={cn("flex h-48 flex-col items-center justify-center gap-2 text-center", className)}
    >
      {searchQuery ? (
        <>
          <SearchIcon size={28} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No results for &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs text-muted-foreground/60 underline-offset-2 hover:underline"
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <BookmarkIcon size={28} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {activeTags.length > 0
              ? `No sites tagged ${activeTags.join(" or ")}`
              : "No saved sites yet"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            Click the bookmark button on any page to save it
          </p>
        </>
      )}
    </div>
  )
}
