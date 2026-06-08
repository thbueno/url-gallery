import "@/style.css"

import { Bookmark, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const PERMISSION_ORIGINS = ["https://*/*"]
const DECLINED_KEY = "permissionDeclined"

async function getPermissionState(): Promise<{ granted: boolean; declined: boolean }> {
  const granted = await chrome.permissions.contains({ origins: PERMISSION_ORIGINS })
  const { [DECLINED_KEY]: declined = false } = await chrome.storage.local.get(DECLINED_KEY)
  return { granted, declined: Boolean(declined) }
}

export default function Popup() {
  const [permGranted, setPermGranted] = useState(false)
  const [permDeclined, setPermDeclined] = useState(false)
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved-full" | "saved-favicon" | "error"
  >("idle")
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    getPermissionState().then(({ granted, declined }) => {
      setPermGranted(granted)
      setPermDeclined(declined)
    })
  }, [])

  async function handleGrantPermission() {
    const granted = await chrome.permissions.request({ origins: PERMISSION_ORIGINS })
    if (granted) {
      setPermGranted(true)
    } else {
      await chrome.storage.local.set({ [DECLINED_KEY]: true })
      setPermDeclined(true)
    }
  }

  async function handleSaveTab() {
    setSaveState("saving")
    setSaveError(null)

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab.url.startsWith("http")) {
      setSaveState("error")
      setSaveError("Can't save this page")
      return
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: "SAVE_REQUEST",
        url: tab.url,
        title: tab.title ?? tab.url,
        imageUrl: undefined,
        faviconUrl: tab.favIconUrl ?? undefined,
        declaredType: undefined,
      })
      if (response?.ok) {
        setSaveState(permGranted ? "saved-full" : "saved-favicon")
        setTimeout(() => setSaveState("idle"), 2500)
      } else {
        setSaveState("error")
        setSaveError(response?.error ?? "Save failed")
      }
    } catch (err) {
      setSaveState("error")
      setSaveError(String(err))
    }
  }

  const isSaved = saveState === "saved-full" || saveState === "saved-favicon"
  const showPermPrompt = !permGranted && !permDeclined

  return (
    <div className="flex w-[300px] flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">URL Gallery</span>
        {permGranted && (
          <Badge variant="secondary" className="text-xs">
            Full thumbnails
          </Badge>
        )}
      </div>

      <Separator />

      {/* Primary action */}
      <Button
        className="w-full"
        disabled={saveState === "saving"}
        onClick={handleSaveTab}
        variant={isSaved ? "secondary" : "default"}
      >
        <Bookmark size={15} className="mr-1.5" />
        {saveState === "saving" ? "Saving…" : isSaved ? "Saved!" : "Save this tab"}
      </Button>

      {/* Post-save feedback — shown only after save */}
      {saveState === "saved-favicon" && (
        <p className="text-xs text-muted-foreground">
          Saved with page icon as thumbnail. For a richer preview, use the bookmark button on the
          page.
        </p>
      )}

      {saveState === "error" && saveError && (
        <p className="text-xs text-destructive">{saveError}</p>
      )}

      {/* Permission upgrade prompt — secondary, below save */}
      {showPermPrompt && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-2 p-3">
            <p className="text-xs text-muted-foreground">
              Enable richer thumbnails by granting access to fetch preview images.
            </p>
            <Button size="sm" variant="outline" className="w-full" onClick={handleGrantPermission}>
              <ShieldCheck size={14} className="mr-1.5" />
              Enable better thumbnails
            </Button>
          </CardContent>
        </Card>
      )}

      {/* After decline — one quiet acknowledgment */}
      {permDeclined && (
        <p className="text-xs text-muted-foreground">Using page icons as thumbnails.</p>
      )}
    </div>
  )
}
