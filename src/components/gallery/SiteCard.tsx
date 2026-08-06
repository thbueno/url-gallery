import { useEffect, useState } from "react"

import { PinIcon, TagIcon, Trash2Icon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ALL_TAGS } from "@/lib/categorizer"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface SiteCardProps {
  site: SavedSite
  onClick: (site: SavedSite) => void
  onTagsChange?: (site: SavedSite, tags: string[]) => void
  onPinToggle?: (site: SavedSite, pinned: boolean) => void
  onDelete?: (site: SavedSite) => void
  className?: string
}

function useBlobUrl(blob: Blob | null): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) return
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

export function SiteCard({
  site,
  onClick,
  onTagsChange,
  onPinToggle,
  onDelete,
  className,
}: SiteCardProps) {
  const thumbUrl = useBlobUrl(site.thumb)
  const domain = getDomain(site.url)

  return (
    <button
      type="button"
      onClick={() => onClick(site)}
      className={cn(
        "group flex w-full cursor-pointer flex-col overflow-hidden rounded-card",
        "border border-border bg-card",
        "transition-colors duration-200",
        "hover:bg-accent hover:ring-2 hover:ring-[hsl(var(--card-hover-ring))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "text-left",
        className
      )}
    >
      {/* Thumbnail or fallback — clean, nothing overlaid */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-card bg-muted">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {site.favicon ? (
              <img src={site.favicon} alt="" className="h-10 w-10 opacity-50" />
            ) : (
              <span className="select-none text-2xl font-semibold text-muted-foreground/30">
                {domain[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content block — title, domain, tag chip, actions */}
      <div className="flex flex-col gap-2 p-3.5">
        <p className="truncate text-sm font-medium leading-tight text-card-foreground">
          {site.title}
        </p>

        <div className="flex items-center justify-between gap-1.5">
          <span className="min-w-0 truncate text-xs text-muted-foreground">{domain}</span>

          {onTagsChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-1 rounded bg-muted px-1.5 py-0.5",
                    "text-[10px] leading-none text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  <TagIcon size={9} />
                  {site.tags.length > 1
                    ? `${site.tags[0]} +${site.tags.length - 1}`
                    : (site.tags[0] ?? "Uncategorized")}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel className="text-[10px]">Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ALL_TAGS.filter((t) => t !== "Uncategorized").map((tag) => {
                  const checked = site.tags.includes(tag)
                  return (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      className="text-xs"
                      checked={checked}
                      onCheckedChange={(next) => {
                        let newTags: string[]
                        if (next) {
                          newTags = [...site.tags.filter((t) => t !== "Uncategorized"), tag]
                        } else {
                          newTags = site.tags.filter((t) => t !== tag)
                          if (newTags.length === 0) newTags = ["Uncategorized"]
                        }
                        onTagsChange(site, newTags)
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
              {site.tags[0] ?? "Uncategorized"}
            </span>
          )}
        </div>

        {/* Actions row — pin, tag-edit affordance, delete */}
        {(onPinToggle || onDelete) && (
          <div className="flex items-center gap-1 pt-0.5">
            {onPinToggle && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onPinToggle(site, !site.pinned)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    onPinToggle(site, !site.pinned)
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={site.pinned ? "Unpin" : "Pin"}
                className={cn(
                  "flex size-6 cursor-pointer items-center justify-center rounded-md transition-opacity",
                  "text-muted-foreground hover:text-foreground",
                  site.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <PinIcon size={12} className={cn(site.pinned && "fill-foreground")} />
              </span>
            )}

            {onDelete && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(site)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    onDelete(site)
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Delete"
                className={cn(
                  "flex size-6 cursor-pointer items-center justify-center rounded-md transition-opacity",
                  "text-muted-foreground hover:text-destructive",
                  "opacity-0 group-hover:opacity-100"
                )}
              >
                <Trash2Icon size={12} />
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
