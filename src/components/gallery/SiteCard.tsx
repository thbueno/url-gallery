import { cva } from "class-variance-authority"
import { CheckIcon, PinIcon } from "lucide-react"

import { Favicon } from "@/components/gallery/Favicon"
import { SiteCardMenu } from "@/components/gallery/SiteCardMenu"
import { SiteThumbnail } from "@/components/gallery/SiteThumbnail"
import { TagChip } from "@/components/gallery/TagChip"
import { TagMenu } from "@/components/gallery/TagMenu"
import { ALL_TAGS, UNCATEGORIZED } from "@/lib/categorizer"
import { getDomain, timeAgo } from "@/lib/format"
import type { SavedSite } from "@/lib/store"
import { displayTags, toggleTag, withTag } from "@/lib/tags"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  [
    "group relative flex w-full flex-col rounded-card bg-surface-section p-card-inset text-left",
    "transition-colors duration-base ease-out hover:bg-surface-tertiary",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      selected: {
        true: "ring-2 ring-ring ring-offset-2 ring-offset-background",
        false: "",
      },
    },
    defaultVariants: { selected: false },
  }
)

const titleVariants = cva("truncate font-medium leading-snug text-foreground", {
  variants: { size: { default: "text-sm", large: "text-base" } },
  defaultVariants: { size: "default" },
})

const checkBadgeVariants = cva(
  [
    "flex size-6 items-center justify-center rounded-md border shadow-xs backdrop-blur-sm",
    "transition-colors duration-fast ease-out motion-reduce:transition-none",
  ],
  {
    variants: {
      selected: {
        true: "border-transparent bg-primary-gradient text-primary-foreground",
        false: "border-border bg-surface-inner/90 text-transparent group-hover:border-border-hover",
      },
    },
    defaultVariants: { selected: false },
  }
)

interface SiteCardProps {
  site: SavedSite
  onClick: (site: SavedSite) => void
  onTagsChange?: (site: SavedSite, tags: string[]) => void
  onPinToggle?: (site: SavedSite, pinned: boolean) => void
  onDelete?: (site: SavedSite) => void
  /** Tag names the "+" menu offers. */
  availableTags?: string[]
  /** "large" is used by the pinned strip. */
  size?: "default" | "large"
  className?: string
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: (site: SavedSite, shiftKey: boolean) => void
}

/**
 * Grey section card, no border or shadow. The thumbnail sits inset by --card-inset and lifts on
 * hover. The thumbnail + title is the one button (open / select); its ::after stretches over the
 * whole card so any spot on the card opens the site. The tag controls and "more" menu are siblings
 * of that button, raised above the stretch with z-10, so they stay separate controls.
 * Parents own placement and size.
 */
export function SiteCard({
  site,
  onClick,
  onTagsChange,
  onPinToggle,
  onDelete,
  availableTags,
  size = "default",
  className,
  selectMode,
  selected,
  onToggleSelect,
}: SiteCardProps) {
  const domain = getDomain(site.url)
  // Tag editing and the "more" menu are off while selecting.
  const editTags = selectMode ? undefined : onTagsChange
  const hasMenu = !selectMode && !!(onPinToggle || onDelete)

  function handleCardClick(e: React.MouseEvent) {
    if (selectMode) {
      onToggleSelect?.(site, e.shiftKey)
    } else {
      onClick(site)
    }
  }

  return (
    <div className={cn(cardVariants({ selected: !!selected }), className)}>
      <button
        type="button"
        onClick={handleCardClick}
        aria-pressed={selectMode ? !!selected : undefined}
        title={site.title}
        className={cn(
          // Not positioned and not transformed, so the ::after below stretches to the card root.
          "group/open flex w-full cursor-pointer flex-col rounded-inner text-left outline-none",
          "after:absolute after:inset-0 after:rounded-card",
          "focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-background"
        )}
      >
        {/* Lifts as one piece: thumbnail plus the select and pin badges on it. */}
        <div
          className={cn(
            "relative rounded-inner shadow-2xs",
            "transition-[transform,box-shadow] duration-base ease-out",
            "group-hover:-translate-y-lift group-hover:shadow-md group-active/open:scale-press",
            "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-active/open:scale-100"
          )}
        >
          <SiteThumbnail site={site} className="rounded-inner" />
          {selectMode || site.pinned ? (
            <div className="absolute left-2 top-2 flex items-center gap-1">
              {selectMode ? (
                <span aria-hidden="true" className={checkBadgeVariants({ selected: !!selected })}>
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
          <h3 className={titleVariants({ size })}>{site.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Favicon site={site} />
            <span className="min-w-0 flex-1 truncate">{domain}</span>
            <span className="shrink-0 tabular-nums">{timeAgo(site.savedAt)}</span>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-1 px-2 pb-2 pt-0.5">
        {displayTags(site.tags).map((tag) => (
          <TagChip
            key={tag}
            name={tag}
            onRemove={
              editTags && tag !== UNCATEGORIZED
                ? () => editTags(site, toggleTag(site.tags, tag))
                : undefined
            }
          />
        ))}
        {editTags ? (
          <TagMenu
            label={`Edit tags for ${site.title}`}
            current={site.tags}
            available={availableTags ?? ALL_TAGS}
            onToggle={(tag) => editTags(site, toggleTag(site.tags, tag))}
            onCreate={(name) => editTags(site, withTag(site.tags, name))}
          />
        ) : null}
      </div>

      {/* Floating "more" menu: shows on hover, keyboard focus, or while open. Hidden when selecting. */}
      {hasMenu ? (
        <div
          className={cn(
            "absolute right-card-inset top-card-inset z-10 p-2",
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
