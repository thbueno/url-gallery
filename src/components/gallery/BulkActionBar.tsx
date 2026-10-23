import {
  CheckCheckIcon,
  PinIcon,
  PinOffIcon,
  TagIcon,
  TagsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { type ReactNode, useState } from "react"

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
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TagCount } from "@/lib/bulk-selection"
import { UNCATEGORIZED } from "@/lib/categorizer"
import { cn } from "@/lib/utils"

interface BulkActionBarProps {
  selectedCount: number
  /** Every tag name that can be added. */
  tagNames: string[]
  /** Tags present in the selection, with how many selected sites carry each. */
  selectionTags: TagCount[]
  /** True when the whole selection is pinned (the button then unpins). */
  allPinned: boolean
  onAddTag: (tag: string) => void | Promise<void>
  onRemoveTag: (tag: string) => void | Promise<void>
  onTogglePin: () => void | Promise<void>
  onDelete: () => void | Promise<void>
  onSelectAll: () => void
  onCancel: () => void
  className?: string
}

interface BarButtonProps {
  label: string
  icon: ReactNode
  disabled?: boolean
  className?: string
  onClick?: () => void
}

/** Ghost button with a text label that collapses to icon-only (with a tooltip) when compact. */
function BarButton({ label, icon, disabled, className, onClick }: BarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={label}
          disabled={disabled}
          className={className}
          onClick={onClick}
        >
          {icon}
          <span className="compact:hidden">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

interface AddTagMenuProps {
  disabled: boolean
  tagNames: string[]
  onPick: (tag: string) => void | Promise<void>
}

function AddTagMenu({ disabled, tagNames, onPick }: AddTagMenuProps) {
  const [draft, setDraft] = useState("")

  function submit() {
    const name = draft.trim()
    if (!name) return
    void onPick(name)
    setDraft("")
  }

  return (
    <DropdownMenu onOpenChange={(open) => !open && setDraft("")}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Add tag" disabled={disabled}>
              <TagIcon aria-hidden="true" />
              <span className="compact:hidden">Add tag</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Add tag</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="center" side="top" className="max-h-72 w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-xs">Add tag to selected</DropdownMenuLabel>
        <div className="px-1.5 pb-1.5">
          <Input
            value={draft}
            placeholder="New tag, then Enter"
            aria-label="New tag name"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Keep menu typeahead from stealing letters.
              e.stopPropagation()
              if (e.key === "Enter") submit()
            }}
          />
        </div>
        <DropdownMenuSeparator />
        {tagNames.map((name) => (
          <DropdownMenuItem key={name} onSelect={() => onPick(name)}>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface RemoveTagMenuProps {
  disabled: boolean
  selectionTags: TagCount[]
  onPick: (tag: string) => void | Promise<void>
}

function RemoveTagMenu({ disabled, selectionTags, onPick }: RemoveTagMenuProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Remove tag"
              disabled={disabled || selectionTags.length === 0}
            >
              <TagsIcon aria-hidden="true" />
              <span className="compact:hidden">Remove tag</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Remove tag</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="center" side="top" className="max-h-72 overflow-y-auto">
        <DropdownMenuLabel className="text-xs">Remove tag from selected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {selectionTags.map(({ name, count }) => (
          <DropdownMenuItem
            key={name}
            onSelect={() => onPick(name)}
            className="justify-between gap-4"
          >
            {name}
            <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Select-mode bar: selected count, add / remove tag, pin / unpin, delete (with confirm),
 * select all, cancel. The parent decides where it floats.
 */
export function BulkActionBar({
  selectedCount,
  tagNames,
  selectionTags,
  allPinned,
  onAddTag,
  onRemoveTag,
  onTogglePin,
  onDelete,
  onSelectAll,
  onCancel,
  className,
}: BulkActionBarProps) {
  const none = selectedCount === 0
  const assignable = tagNames.filter((name) => name !== UNCATEGORIZED)

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex min-w-0 items-center gap-1 rounded-full border border-border bg-background px-2 py-1.5 shadow-pop",
          className
        )}
      >
        <span className="whitespace-nowrap px-2 text-sm font-medium tabular-nums">
          {selectedCount} selected
        </span>

        <AddTagMenu disabled={none} tagNames={assignable} onPick={onAddTag} />
        <RemoveTagMenu disabled={none} selectionTags={selectionTags} onPick={onRemoveTag} />

        <BarButton
          label={allPinned ? "Unpin" : "Pin"}
          icon={allPinned ? <PinOffIcon aria-hidden="true" /> : <PinIcon aria-hidden="true" />}
          disabled={none}
          onClick={() => void onTogglePin()}
        />

        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete"
                  disabled={none}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2Icon aria-hidden="true" />
                  <span className="compact:hidden">Delete</span>
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">Delete</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {selectedCount} site{selectedCount === 1 ? "" : "s"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action can't be undone. This will permanently remove the selected sites from
                your gallery.
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

        <BarButton
          label="Select all"
          icon={<CheckCheckIcon aria-hidden="true" />}
          onClick={onSelectAll}
        />
        <BarButton label="Cancel" icon={<XIcon aria-hidden="true" />} onClick={onCancel} />
      </div>
    </TooltipProvider>
  )
}
