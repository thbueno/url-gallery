import "@/style.css"

import { Bookmark, LayoutGrid, ShieldCheck } from "lucide-react"
import { useEffect, useLayoutEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GENERIC_OG_DOMAINS } from "@/lib/thumbnail-service"
import { withTimeout } from "@/lib/utils"
import { getYoutubeThumbnailUrls, getYoutubeVideoId } from "@/lib/youtube"

const PERMISSION_ORIGINS = ["https://*/*"]
const DECLINED_KEY = "permissionDeclined"
// Best-effort "already saved" check — never worth blocking/delaying the
// popup UI over, so it's capped and silently skipped on timeout or error.
const ALREADY_SAVED_CHECK_TIMEOUT_MS = 2000

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
  // True when saveState was initialized from an existing SavedSite found on
  // popup open, rather than from a save just performed in this session. Keeps
  // the post-save "page icon" hint from wrongly reappearing on reopen.
  const [alreadySavedOnOpen, setAlreadySavedOnOpen] = useState(false)

  // Removes the static popup.html skeleton (see scripts/generate-popup-html.mjs)
  // in the same commit as the real popup's first paint, so the swap doesn't
  // cause a visible double-paint flash.
  useLayoutEffect(() => {
    document.getElementById("__plasmo_skeleton")?.remove()
  }, [])

  useEffect(() => {
    getPermissionState().then(({ granted, declined }) => {
      setPermGranted(granted)
      setPermDeclined(declined)
    })

    withTimeout(
      chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
        if (!tab?.url || !tab.url.startsWith("http")) {
          return undefined
        }
        const { savedSiteStore } = await import("@/lib/store")
        return savedSiteStore.getByUrl(tab.url)
      }),
      ALREADY_SAVED_CHECK_TIMEOUT_MS
    ).then((existing) => {
      if (existing) {
        setAlreadySavedOnOpen(true)
        setSaveState("saved-favicon")
      }
    })
  }, [])

  function handleOpenGallery() {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/gallery.html") })
  }

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
    if (!tab?.url || !tab.url.startsWith("http") || tab.id === undefined) {
      setSaveState("error")
      setSaveError("Can't save this page")
      return
    }

    let imageUrl: string | undefined
    let faviconUrl: string | undefined = tab.favIconUrl ?? undefined
    let title: string = tab.title ?? tab.url
    let declaredType: string | undefined
    let screenshotDataUrl: string | undefined

    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const getMeta = (attr: string, value: string) =>
            (document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null)?.content
          return {
            imageUrl: getMeta("property", "og:image"),
            faviconUrl: (document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null)
              ?.href,
            title:
              getMeta("property", "og:title") ?? getMeta("name", "twitter:title") ?? document.title,
            declaredType: getMeta("property", "og:type"),
          }
        },
      })
      if (result?.result) {
        imageUrl = result.result.imageUrl ?? undefined
        faviconUrl = result.result.faviconUrl ?? faviconUrl
        title = result.result.title ?? title
        declaredType = result.result.declaredType ?? undefined
      }
    } catch {
      // executeScript fails on chrome:// pages and restricted origins — fall through
    }

    const hostname = new URL(tab.url).hostname.replace(/^www\./, "")

    const youtubeVideoId = getYoutubeVideoId(tab.url)
    if (youtubeVideoId !== undefined) {
      imageUrl = getYoutubeThumbnailUrls(youtubeVideoId)[0]
      // YouTube's og:title/document.title lag behind the SPA's client render
      // at script-injection time, so extraction above often grabs the
      // placeholder "YouTube" instead of the real video title. tab.title
      // reflects the already-rendered tab bar title, which is reliable here.
      if (tab.title) {
        title = tab.title.replace(/ - YouTube$/, "")
      }
    }

    // Tab titles (and some sites' document.title, used as an og:title
    // fallback above) can carry a leading unread-count badge, e.g.
    // "(3) Video Title" or "(1) Name on X: ...". That badge isn't part of
    // the real title, so strip it before saving.
    title = title.replace(/^\(\d+\)\s*/, "")

    if (GENERIC_OG_DOMAINS.includes(hostname)) {
      try {
        screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" })
      } catch {
        // Capture can fail for various reasons — fall back to the existing
        // imageUrl/faviconUrl chain in that case.
      }
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: "SAVE_REQUEST",
        url: tab.url,
        title,
        imageUrl,
        faviconUrl,
        declaredType,
        screenshotDataUrl,
      })
      if (response?.ok) {
        setAlreadySavedOnOpen(false)
        setSaveState(permGranted ? "saved-full" : "saved-favicon")
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
        <div className="flex items-center gap-1.5">
          {permGranted && (
            <Badge variant="secondary" className="text-xs">
              Full thumbnails
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={handleOpenGallery}
            aria-label="Open gallery"
          >
            <LayoutGrid size={15} />
          </Button>
        </div>
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
      {saveState === "saved-favicon" && !alreadySavedOnOpen && (
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
