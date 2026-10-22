import { CheckIcon, PinIcon } from "lucide-react"

import { Favicon } from "@/components/gallery/Favicon"
import { SiteCardMenu } from "@/components/gallery/SiteCardMenu"
import { SiteThumbnail } from "@/components/gallery/SiteThumbnail"
import { TagChip } from "@/components/gallery/TagChip"
import { TagMenu } from "@/components/gallery/TagMenu"
import { ALL_TAGS, UNCATEGORIZED } from "@/lib/categorizer"
import { getDomain, timeAgo } from "@/lib/format"
import type { SavedSite } from "@/lib/store"
import { toggleTag, withTag } from "@/lib/tags"
import { cn } from "@/lib/utils"

interface SiteCardProps {
  site: SavedSite
  onClick: (site: SavedSite) => void
  onTagsChange?: (site: SavedSite, tags: string[]) => void
  onPinToggle?: (site: SavedSite, pinned: boolean) => void
  onDelete?: (site: SavedSite) => void
  /** Tag names the "+" menu offers. */
  availableTags?: string[]
  className?: string
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: (site: SavedSite) => void
}

/**
 * Grey section card, no border or shadow. The thumbnail sits inset by --card-inset and lifts on
 * hover. The card is a plain container: the thumbnail + title is the one button (open / select),
 * and the tag row and "more" menu are siblings of it, so they never open the site.
 * Parents own placement and size.
 */
export function SiteCard({
  site,
  onClick,
  onTagsChange,
  onPinToggle,
  onDelete,
  availableTags,
  className,
  selectMode,
  selected,
  onToggleSelect,
}: SiteCardProps) {
  const domain = getDomain(site.url)

  function handleCardClick() {
    if (selectMode) {
      onToggleSelect?.(site)
    } else {
      onClick(site)
    }
  }

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col rounded-card bg-surface-section p-card-inset text-left",
        "transition-colors duration-base ease-out hover:bg-surface-tertiary",
        "motion-reduce:transition-none",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        className
      )}
    >
      <button
        type="button"
        onClick={handleCardClick}
        aria-pressed={selectMode ? !!selected : undefined}
        title={site.title}
        className={cn(
          "flex w-full cursor-pointer flex-col rounded-inner text-left outline-none",
          "transition-transform duration-fast ease-out active:scale-press",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none motion-reduce:active:scale-100"
        )}
      >
        {/* Lifts as one piece: thumbnail plus the select and pin badges on it. */}
        <div
          className={cn(
            "relative rounded-inner shadow-2xs",
            "transition-[transform,box-shadow] duration-base ease-out",
            "group-hover:-translate-y-lift group-hover:shadow-md",
            "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          )}
        >
          <SiteThumbnail site={site} className="rounded-inner" />
          {selectMode || site.pinned ? (
            <div className="absolute left-2 top-2 flex items-center gap-1">
              {selectMode ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md border shadow-xs backdrop-blur-sm",
                    "transition-colors duration-fast ease-out motion-reduce:transition-none",
                    selected
                      ? "border-transparent bg-primary-gradient text-primary-foreground"
                      : "border-border bg-surface-inner/90 text-transparent group-hover:border-border-hover"
                  )}
                >
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                </span>
              ) : null}
              {site.pinned ? (
                <span
                  role="img"
                  aria-label="Pinned"
                  className="flex size-6 items-center justify-center rounded-md bg-surface-inner/90 text-muted-foreground shadow-xs backdrop-blur-sm"
                >
                  <PinIcon className="size-3" aria-hidden="true" />
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-1.5 px-2 pb-1.5 pt-2.5">
          <h3 className="truncate text-sm font-medium leading-snug text-foreground">
            {site.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Favicon site={site} />
            <span className="min-w-0 flex-1 truncate">{domain}</span>
            <span className="shrink-0 tabular-nums">{timeAgo(site.savedAt)}</span>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-1 px-2 pb-2 pt-0.5">
        {site.tags.map((tag) => (
          <TagChip
            key={tag}
            name={tag}
            onRemove={
              onTagsChange && tag !== UNCATEGORIZED
                ? () => onTagsChange(site, toggleTag(site.tags, tag))
                : undefined
            }
          />
        ))}
        {onTagsChange ? (
          <TagMenu
            label={`Edit tags for ${site.title}`}
            current={site.tags}
            available={availableTags ?? ALL_TAGS}
            onToggle={(tag) => onTagsChange(site, toggleTag(site.tags, tag))}
            onCreate={(name) => onTagsChange(site, withTag(site.tags, name))}
          />
        ) : null}
      </div>

      {/* Floating "more" menu: shows on hover, keyboard focus, or while open. Hidden when selecting. */}
      {!selectMode && (onPinToggle || onDelete) ? (
        <div
          className={cn(
            "absolute right-card-inset top-card-inset p-2",
            "opacity-0 transition-opacity duration-fast ease-out motion-reduce:transition-none",
            "group-hover:opacity-100 group-focus-within:opacity-100 has-[[data-state=open]]:opacity-100"
          )}
        >
          <SiteCardMenu
            title={site.title}
            pinned={site.pinned}
            onPinToggle={onPinToggle ? () => onPinToggle(site, !site.pinned) : undefined}
            onDelete={onDelete ? () => onDelete(site) : undefined}
          />
        </div>
      ) : null}
    </div>
  )
}
