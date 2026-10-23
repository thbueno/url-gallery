import { ImageIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface PermissionBannerProps {
  onDismiss: () => void
  onGranted: () => void
  className?: string
}

/** Shown when the user declined the host permission needed for real thumbnails. */
export function PermissionBanner({ onDismiss, onGranted, className }: PermissionBannerProps) {
  const [requesting, setRequesting] = useState(false)

  async function handleEnable() {
    setRequesting(true)
    try {
      const granted = await chrome.permissions.request({ origins: ["https://*/*"] })
      if (granted) {
        await chrome.storage.local.remove("permissionDeclined")
        onDismiss()
        onGranted()
      }
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-4 py-2",
        className
      )}
    >
      <ImageIcon size={13} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 text-xs text-muted-foreground">
        Thumbnails are showing page icons.{" "}
        <button
          type="button"
          disabled={requesting}
          onClick={handleEnable}
          className="font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-50"
        >
          Enable full thumbnails
        </button>
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground"
      >
        <XIcon size={13} />
      </button>
    </div>
  )
}
