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
        "group relative w-full cursor-pointer overflow-hidden rounded-card",
        "aspect-[4/3] border border-border bg-muted",
        "transition-all duration-200",
        "hover:scale-[1.02] hover:ring-2 hover:ring-[hsl(var(--card-hover-ring))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "text-left",
        className
      )}
    >
      {/* Pin button — top-right, hover-visible; always visible when pinned */}
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
            "absolute right-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-md",
            "bg-black/40 text-white backdrop-blur-sm transition-opacity",
            site.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            "hover:bg-black/60 cursor-pointer"
          )}
        >
          <PinIcon size={11} className={cn(site.pinned && "fill-white")} />
        </span>
      )}

      {/* Delete button — top-left, hover-visible */}
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
            "absolute left-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-md",
            "bg-black/40 text-white backdrop-blur-sm transition-opacity",
            "opacity-0 group-hover:opacity-100",
            "hover:bg-red-600/80 cursor-pointer"
          )}
        >
          <Trash2Icon size={11} />
        </span>
      )}

      {/* Thumbnail or fallback */}
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

      {/* Bottom scrim + metadata */}
      <div
        className="absolute inset-x-0 bottom-0 p-2.5"
        style={{ background: "var(--thumb-scrim)" }}
      >
        <p className="truncate text-xs font-medium leading-tight text-white">{site.title}</p>
        <div className="mt-1 flex items-center justify-between gap-1.5">
          <span className="min-w-0 truncate text-[10px] text-white/60">{domain}</span>

          {onTagsChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span
                  className={cn(
                    "shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] leading-none text-white/80",
                    "opacity-0 transition-opacity group-hover:opacity-100",
                    "flex items-center gap-1 cursor-pointer hover:bg-white/20"
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
            <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] leading-none text-white/80">
              {site.tags[0] ?? "Uncategorized"}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
