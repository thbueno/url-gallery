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
import { UNCATEGORIZED } from "@/lib/categorizer"
import { cn } from "@/lib/utils"

interface BulkActionBarProps {
  selectedCount: number
  /** Tag names offered in the add / remove menus. */
  tagNames: string[]
  onAddTag: (tag: string) => void | Promise<void>
  onRemoveTag: (tag: string) => void | Promise<void>
  onDelete: () => void | Promise<void>
  onClear: () => void
  className?: string
}

interface TagMenuProps {
  label: string
  heading: string
  disabled: boolean
  tagNames: string[]
  onPick: (tag: string) => void | Promise<void>
}

function TagMenu({ label, heading, disabled, tagNames, onPick }: TagMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-[10px]">{heading}</DropdownMenuLabel>
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

/** Select-mode toolbar: selection count, add / remove tag, delete (with confirm), clear. */
export function BulkActionBar({
  selectedCount,
  tagNames,
  onAddTag,
  onRemoveTag,
  onDelete,
  onClear,
  className,
}: BulkActionBarProps) {
  const none = selectedCount === 0
  const assignable = tagNames.filter((name) => name !== UNCATEGORIZED)

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1 rounded-full border border-border bg-background px-2 py-1.5",
        className
      )}
    >
      <span className="px-2 text-sm font-medium tabular-nums">{selectedCount} selected</span>

      <TagMenu
        label="Add tag"
        heading="Add tag to selected"
        disabled={none}
        tagNames={assignable}
        onPick={onAddTag}
      />
      <TagMenu
        label="Remove tag"
        heading="Remove tag from selected"
        disabled={none}
        tagNames={assignable}
        onPick={onRemoveTag}
      />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={none}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount} site{selectedCount === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action can't be undone. This will permanently remove the selected sites from your
              gallery.
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

      <button
        type="button"
        onClick={onClear}
        disabled={none}
        className="px-2 text-xs text-muted-foreground/60 underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
      >
        Clear
      </button>
    </div>
  )
}
