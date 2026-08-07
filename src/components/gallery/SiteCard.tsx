import { useEffect, useState } from "react"

import { CheckIcon, ChevronDownIcon, PinIcon, TagIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  availableTags?: string[]
  className?: string
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: (site: SavedSite) => void
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
  availableTags,
  className,
  selectMode,
  selected,
  onToggleSelect,
}: SiteCardProps) {
  const thumbUrl = useBlobUrl(site.thumb)
  const domain = getDomain(site.url)

  function handleCardClick() {
    if (selectMode) {
      onToggleSelect?.(site)
    } else {
      onClick(site)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className={cn(
        "group flex w-full cursor-pointer flex-col overflow-hidden rounded-card",
        "bg-card",
        "transition-colors duration-200",
        "hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected && "ring-2 ring-ring ring-offset-2",
        "text-left",
        className
      )}
    >
      {/* Thumbnail or fallback, with floating glass control pill */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-card bg-muted">
        {/* Selection checkbox — top-left, mirrors the glass pill's visual language */}
        {selectMode && (
          <div className="absolute left-2 top-2 z-10">
            <span
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelect?.(site)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation()
                  onToggleSelect?.(site)
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-pressed={!!selected}
              aria-label={selected ? "Deselect" : "Select"}
              className={cn(
                "flex size-6 cursor-pointer items-center justify-center rounded-md border backdrop-blur-md transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/60 bg-black/40 text-transparent hover:border-white"
              )}
            >
              <CheckIcon size={14} />
            </span>
          </div>
        )}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            className="absolute inset-0 h-full w-full rounded-t-card object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-t-card">
            {site.favicon ? (
              <img src={site.favicon} alt="" className="h-10 w-10 opacity-50" />
            ) : (
              <span className="select-none text-2xl font-semibold text-muted-foreground/30">
                {domain[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        )}

        {/* Glass control pill — pin, delete, floating over the image */}
        {(onPinToggle || onDelete) && (
          <div
            className={cn(
              "absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-black/40 p-1 backdrop-blur-md transition-opacity",
              site.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
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
                  "flex size-6 cursor-pointer items-center justify-center rounded-full",
                  "text-white/90 hover:text-white"
                )}
              >
                <PinIcon size={12} className={cn(site.pinned && "fill-white")} />
              </span>
            )}

            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation()
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Delete"
                    className={cn(
                      "flex size-6 cursor-pointer items-center justify-center rounded-full",
                      "text-white/90 hover:text-red-400"
                    )}
                  >
                    <Trash2Icon size={12} />
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{site.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action can't be undone. This will permanently remove the site from your
                      gallery.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(site)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      {/* Content block — title, domain + tag chip */}
      <div className="flex flex-col gap-2 p-3.5">
        <p className="truncate text-sm font-medium leading-tight text-card-foreground">
          {site.title}
        </p>

        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{domain}</span>

          {onTagsChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span
                  className={cn(
                    "group flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1",
                    "text-[11px] leading-none text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  )}
                  aria-label="Edit tags"
                >
                  {site.tags.length > 1
                    ? `${site.tags[0]} +${site.tags.length - 1}`
                    : (site.tags[0] ?? "Uncategorized")}
                  <ChevronDownIcon
                    size={11}
                    className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
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
                {(availableTags ?? ALL_TAGS)
                  .filter((t) => t !== "Uncategorized")
                  .map((tag) => {
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
                        onSelect={(e) => e.preventDefault()}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1",
                "text-[10px] leading-none text-muted-foreground"
              )}
            >
              <TagIcon size={10} />
              {site.tags[0] ?? "Uncategorized"}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
