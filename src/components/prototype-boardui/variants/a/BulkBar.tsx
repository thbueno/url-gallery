import { Pin, PinOff, Tag, Tags, Trash2 } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { TagDot } from "./TagChip"
import { BulkAddMenuBody } from "./TagMenu"

export interface BulkBarProps {
  count: number
  /** Total sites currently shown (for the Select all label state). */
  visibleCount: number
  availableTags: string[]
  /** Tags present in the selection, with how many selected sites carry each. */
  selectionTags: { name: string; count: number }[]
  allSelectedPinned: boolean
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onTogglePin: () => void
  onDelete: () => void
  onSelectAll: () => void
  onCancel: () => void
  className?: string
}

const ghost = cn(
  "h-8 gap-1.5 rounded-[var(--radius-inner)] px-2.5 text-sm font-medium text-foreground",
  "transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none"
)

/** Floating bulk-action bar. Parents own where it sits. All actions hit the in-memory overlay. */
export function BulkBar({
  count,
  visibleCount,
  availableTags,
  selectionTags,
  allSelectedPinned,
  onAddTag,
  onRemoveTag,
  onTogglePin,
  onDelete,
  onSelectAll,
  onCancel,
  className,
}: BulkBarProps) {
  const none = count === 0
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "flex max-w-full items-center gap-0.5 rounded-card border border-border bg-[hsl(var(--surface-inner))] p-1.5 shadow-[var(--shadow-pop)]",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out motion-reduce:animate-none",
        className
      )}
    >
      <span
        className="px-2.5 text-sm font-medium whitespace-nowrap tabular-nums"
        aria-live="polite"
      >
        {count} selected
      </span>
      <span className="mx-1 h-5 w-px bg-[hsl(var(--separator))]" aria-hidden="true" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" disabled={none} aria-label="Add tag" className={ghost}>
            <Tag className="!size-3.5" aria-hidden="true" />
            <span className="max-[999px]:sr-only">Add tag</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <BulkAddMenuBody available={availableTags} onAdd={onAddTag} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            disabled={none || selectionTags.length === 0}
            aria-label="Remove tag"
            className={ghost}
          >
            <Tags className="!size-3.5" aria-hidden="true" />
            <span className="max-[999px]:sr-only">Remove tag</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Remove tag from selected
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {selectionTags.map((t) => (
            <DropdownMenuItem key={t.name} onSelect={() => onRemoveTag(t.name)}>
              <TagDot name={t.name} className="mr-2" />
              <span className="min-w-0 flex-1 truncate">{t.name}</span>
              <span className="ml-3 text-xs text-muted-foreground tabular-nums">{t.count}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        disabled={none}
        onClick={onTogglePin}
        aria-label={allSelectedPinned ? "Unpin" : "Pin"}
        className={ghost}
      >
        {allSelectedPinned ? (
          <PinOff className="!size-3.5" aria-hidden="true" />
        ) : (
          <Pin className="!size-3.5" aria-hidden="true" />
        )}
        <span className="max-[999px]:sr-only">{allSelectedPinned ? "Unpin" : "Pin"}</span>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            disabled={none}
            aria-label="Delete"
            className={cn(ghost, "text-destructive hover:text-destructive")}
          >
            <Trash2 className="!size-3.5" aria-hidden="true" />
            <span className="max-[999px]:sr-only">Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} site{count === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Prototype only: this removes them from the in-memory list until you reload the page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <span className="mx-1 h-5 w-px bg-[hsl(var(--separator))]" aria-hidden="true" />
      <Button
        variant="ghost"
        disabled={visibleCount === 0 || count === visibleCount}
        onClick={onSelectAll}
        className={cn(ghost, "text-muted-foreground hover:text-foreground")}
      >
        Select all
      </Button>
      <Button
        variant="ghost"
        onClick={onCancel}
        className={cn(ghost, "text-muted-foreground hover:text-foreground")}
      >
        Cancel
      </Button>
    </div>
  )
}
