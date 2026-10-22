import { PermissionPrompt } from "@/components/popup/PermissionPrompt"
import { PopupHeader } from "@/components/popup/PopupHeader"
import { PopupNote } from "@/components/popup/PopupNote"
import { SaveButton } from "@/components/popup/SaveButton"
import { Separator } from "@/components/ui/separator"
import type { SaveState } from "@/hooks/usePopupSave"
import { cn } from "@/lib/utils"

/** Popup hint/note copy, shared by the real popup and the design-system demos. */
export const POPUP_COPY = {
  savedWithIcon: "Saved with the page icon as its thumbnail.",
  savedWithIconUpsell:
    "Saved with the page icon as its thumbnail. Enable better thumbnails below for a richer preview.",
  declined: "Using page icons as thumbnails.",
} as const

interface PopupBodyProps {
  saveState: SaveState
  /** Whether the current page is saved (from `usePopupSave`). */
  isSaved: boolean
  saveError: string | null
  /** Host permission granted: shows the "Full thumbnails" chip. */
  permGranted: boolean
  permDeclined: boolean
  showPermPrompt: boolean
  /** Saved state came from a previous session, so the post-save hint is skipped. */
  alreadySavedOnOpen: boolean
  onOpenGallery: () => void
  onGrantPermission: () => void
  onSave: () => void
  className?: string
}

/** The whole toolbar popup content. The parent supplies the frame (width, padding, background). */
export function PopupBody({
  saveState,
  isSaved,
  saveError,
  permGranted,
  permDeclined,
  showPermPrompt,
  alreadySavedOnOpen,
  onOpenGallery,
  onGrantPermission,
  onSave,
  className,
}: PopupBodyProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <PopupHeader fullThumbnails={permGranted} onOpenGallery={onOpenGallery} />

      <Separator />

      <SaveButton
        className="w-full"
        saved={isSaved}
        saving={saveState === "saving"}
        onClick={onSave}
      />

      {/* Post-save feedback — shown only after a save made in this session */}
      {saveState === "saved-favicon" && !alreadySavedOnOpen && (
        <PopupNote>
          {showPermPrompt ? POPUP_COPY.savedWithIconUpsell : POPUP_COPY.savedWithIcon}
        </PopupNote>
      )}

      {saveState === "error" && saveError && <PopupNote tone="error">{saveError}</PopupNote>}

      {showPermPrompt && <PermissionPrompt onGrant={onGrantPermission} />}

      {/* After decline — one quiet acknowledgment */}
      {permDeclined && <PopupNote>{POPUP_COPY.declined}</PopupNote>}
    </div>
  )
}
