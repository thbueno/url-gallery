import { MoreHorizontalIcon, PinIcon, PinOffIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface SiteCardMenuProps {
  title: string
  pinned: boolean
  onPinToggle?: () => void
  onDelete?: () => void
  className?: string
}

/**
 * Small "more" menu with Pin/Unpin and Delete. Delete asks for confirmation first.
 * The parent decides whether to render it at all (pass at least one action).
 */
export function SiteCardMenu({
  title,
  pinned,
  onPinToggle,
  onDelete,
  className,
}: SiteCardMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      {/* Not modal: a modal menu that hands off to the dialog can leave the page unclickable. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={`More actions for ${title}`}
            className={cn("size-6", className)}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {onPinToggle ? (
            <DropdownMenuItem onSelect={onPinToggle}>
              {pinned ? <PinOffIcon aria-hidden="true" /> : <PinIcon aria-hidden="true" />}
              {pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
          ) : null}
          {onDelete ? (
            <DropdownMenuItem
              onSelect={() => setConfirmOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2Icon aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can't be undone. This will permanently remove the site from your gallery.
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
    </>
  )
}
