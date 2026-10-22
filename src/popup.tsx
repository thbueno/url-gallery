import "@/style.css"
import "@/store/themeStore"

import { useLayoutEffect } from "react"

import { PopupBody } from "@/components/popup/PopupBody"
import { usePopupSave } from "@/hooks/usePopupSave"

export default function Popup() {
  const {
    permGranted,
    permDeclined,
    saveState,
    saveError,
    alreadySavedOnOpen,
    isSaved,
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
    <div className="w-[300px] bg-background p-4 text-foreground">
      <PopupBody
        saveState={saveState}
        isSaved={isSaved}
        saveError={saveError}
        permGranted={permGranted}
        permDeclined={permDeclined}
        showPermPrompt={showPermPrompt}
        alreadySavedOnOpen={alreadySavedOnOpen}
        onOpenGallery={handleOpenGallery}
        onGrantPermission={handleGrantPermission}
        onSave={handleSaveTab}
      />
    </div>
  )
}
