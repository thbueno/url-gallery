import "@/style.css"
import "@/store/themeStore"

import { useLayoutEffect } from "react"

import { PermissionPrompt } from "@/components/popup/PermissionPrompt"
import { PopupHeader } from "@/components/popup/PopupHeader"
import { PopupNote } from "@/components/popup/PopupNote"
import { SaveButton } from "@/components/popup/SaveButton"
import { Separator } from "@/components/ui/separator"
import { usePopupSave } from "@/hooks/usePopupSave"

export default function Popup() {
  const {
    permGranted,
    permDeclined,
    saveState,
    saveError,
    alreadySavedOnOpen,
    showPermPrompt,
    handleOpenGallery,
    handleGrantPermission,
    handleSaveTab,
  } = usePopupSave()

  // Removes the static popup.html skeleton (see scripts/generate-popup-html.mjs)
  // in the same commit as the real popup's first paint, so the swap doesn't
  // cause a visible double-paint flash.
  useLayoutEffect(() => {
    document.getElementById("__plasmo_skeleton")?.remove()
  }, [])

  return (
    <div className="flex w-[300px] flex-col gap-3 bg-background p-4 text-foreground">
      <PopupHeader fullThumbnails={permGranted} onOpenGallery={handleOpenGallery} />

      <Separator className="bg-separator" />

      <SaveButton state={saveState} onClick={handleSaveTab} />

      {/* Post-save feedback — shown only after a save made in this session */}
      {saveState === "saved-favicon" && !alreadySavedOnOpen && (
        <PopupNote>
          {showPermPrompt
            ? "Saved with the page icon as its thumbnail. Enable better thumbnails below for a richer preview."
            : "Saved with the page icon as its thumbnail."}
        </PopupNote>
      )}

      {saveState === "error" && saveError && <PopupNote tone="error">{saveError}</PopupNote>}

      {showPermPrompt && <PermissionPrompt onGrant={handleGrantPermission} />}

      {/* After decline — one quiet acknowledgment */}
      {permDeclined && <PopupNote>Using page icons as thumbnails.</PopupNote>}
    </div>
  )
}
