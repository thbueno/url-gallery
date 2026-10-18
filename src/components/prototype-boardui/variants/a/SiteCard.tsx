import { Check, Pin, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Favicon } from "../../atoms"
import { siteKey } from "../../editState"
import { getDomain, timeAgo } from "../../helpers"
import { TagChip } from "./TagChip"
import { CardTagMenuBody } from "./TagMenu"
import { Thumb } from "./Thumb"

export interface SiteCardProps {
  site: SavedSite
  onOpen: (url: string) => void
  /** Every tag name the "+" menu can offer. */
  availableTags: string[]
  onToggleTag: (key: string, tag: string) => void
  /** "feature" = larger pinned-strip card; "grid" = standard gallery card. */
  size?: "feature" | "grid"
  selectMode?: boolean
  selected?: boolean
  /** In select mode a click toggles selection; `shift` asks for a range. */
  onSelect?: (site: SavedSite, shift: boolean) => void
  className?: string
}

/**
 * Grey section card (no border, no shadow) with the thumbnail inset by 6px.
 * Concentric radii: thumb = card radius - inset, via --radius-inner (= 1.5r - 6px).
 * The card is a plain container: the thumbnail + title area is one button (open / select) and the
 * tag row below it is a sibling, so tag clicks never open the site.
 */
export function SiteCard({
  site,
  onOpen,
  availableTags,
  onToggleTag,
  size = "grid",
  selectMode = false,
  selected = false,
  onSelect,
  className,
}: SiteCardProps) {
  const feature = size === "feature"
  const domain = getDomain(site.url)
  const key = siteKey(site)

  return (
    <div
      className={cn(
        "group flex w-full flex-col rounded-card bg-[hsl(var(--surface-section))] p-1.5 text-left",
        "transition-[background-color,box-shadow] duration-200 ease-out",
        "hover:bg-[hsl(var(--surface-tertiary))]",
        selected && "shadow-[0_0_0_2px_hsl(var(--ring))]",
        className
      )}
    >
      <button
        type="button"
        onClick={(e) => (selectMode ? onSelect?.(site, e.shiftKey) : onOpen(site.url))}
        aria-pressed={selectMode ? selected : undefined}
        title={site.title}
        className={cn(
          "flex w-full flex-col rounded-[var(--radius-inner)] text-left outline-none",
          "transition-transform duration-150 ease-out active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none motion-reduce:active:scale-100"
        )}
      >
        <div className="relative">
          <Thumb
            site={site}
            className={cn(
              "rounded-[var(--radius-inner)] shadow-[var(--shadow-card)]",
              "transition-[transform,box-shadow] duration-200 ease-out",
              "group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-md)]",
              "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
            )}
          />
          {selectMode ? (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2 left-2 flex size-6 items-center justify-center rounded-md border shadow-[var(--shadow-xs)] backdrop-blur-sm",
                "transition-[background-color,border-color,color] duration-150 ease-out",
                selected
                  ? "border-transparent bg-[linear-gradient(180deg,hsl(var(--primary-gradient-from)),hsl(var(--primary-gradient-to)))] text-primary-foreground"
                  : "border-border bg-[hsl(var(--surface-inner)/0.9)] text-transparent group-hover:border-[hsl(var(--border-hover))]"
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          ) : null}
          {site.pinned ? (
            <span
              aria-label="Pinned"
              className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md bg-[hsl(var(--surface-inner)/0.9)] text-muted-foreground shadow-[var(--shadow-xs)] backdrop-blur-sm"
            >
              <Pin className="size-3" aria-hidden="true" />
            </span>
          ) : null}
        </div>

        <div
          className={cn("flex w-full flex-col gap-1.5 px-2 pt-2.5 pb-1.5", feature && "gap-2 pt-3")}
        >
          <h3
            className={cn(
              "truncate font-medium leading-snug tracking-[-0.01em] text-foreground",
              feature ? "text-base" : "text-sm"
            )}
          >
            {site.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Favicon site={site} size="xs" />
            <span className="min-w-0 flex-1 truncate">{domain}</span>
            <span className="shrink-0 tabular-nums">{timeAgo(site.savedAt)}</span>
          </div>
        </div>
      </button>

      {/* Tag row: chips with remove (x), plus a "+" menu to toggle existing tags or type a new one. */}
      <div
        className={cn("flex flex-wrap items-center gap-1 px-2 pt-0.5 pb-2", feature && "pb-2.5")}
      >
        {site.tags.map((tag) => (
          <TagChip key={tag} name={tag} onRemove={() => onToggleTag(key, tag)} />
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Edit tags for ${site.title}`}
              className={cn(
                "flex size-5 items-center justify-center rounded-sm border border-dashed border-border text-muted-foreground outline-none",
                "transition-[color,background-color,border-color,transform] duration-150 ease-out",
                "hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--surface-inner))] hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.9] data-[state=open]:border-solid data-[state=open]:bg-[hsl(var(--surface-inner))] data-[state=open]:text-foreground"
              )}
            >
              <Plus className="size-3" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <CardTagMenuBody
              available={availableTags}
              current={site.tags}
              onToggle={(tag) => onToggleTag(key, tag)}
              onAdd={(tag) => {
                if (!site.tags.includes(tag)) onToggleTag(key, tag)
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
