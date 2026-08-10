import { categorize } from "@/lib/categorizer"
import { parseMessage } from "@/lib/messages"
import { savedSiteStore } from "@/lib/store"
import { fetchAndResize } from "@/lib/thumbnail-service"
import { getYoutubeThumbnailUrls, getYoutubeVideoId } from "@/lib/youtube"

async function handleMessage(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  let msg: ReturnType<typeof parseMessage>
  try {
    msg = parseMessage(raw)
  } catch (err) {
    return { ok: false, error: String(err) }
  }

  switch (msg.type) {
    case "SAVE_REQUEST": {
      const domain = new URL(msg.url).hostname
      const siteName = domain.replace(/^www\./, "").split(".")[0]
      const tags = categorize(msg.declaredType, siteName, domain)

      const created = await savedSiteStore.add({
        url: msg.url,
        title: msg.title,
        favicon: msg.faviconUrl ?? null,
        thumb: null,
        tags,
      })

      new BroadcastChannel("url-gallery").postMessage({ type: "SITE_SAVED" })

      const id = created.id
      if (id !== undefined && (msg.screenshotDataUrl || msg.imageUrl || msg.faviconUrl)) {
        // Fire-and-forget: backfill the real thumbnail after responding, so the
        // popup's confirmation doesn't wait on the network fetch + resize.
        // A tab screenshot (when present) takes priority over the fetched
        // og:image — some domains (see GENERIC_OG_DOMAINS) serve the same
        // generic branded og:image to every unauthenticated request, so the
        // fetch "succeeds" but produces a useless, non-representative thumbnail.
        ;(async () => {
          try {
            const youtubeVideoId = getYoutubeVideoId(msg.url)
            const youtubeFallbacks =
              youtubeVideoId !== undefined ? getYoutubeThumbnailUrls(youtubeVideoId).slice(1) : []
            const thumbBlob = await fetchAndResize(
              msg.screenshotDataUrl ?? msg.imageUrl ?? msg.faviconUrl ?? "",
              msg.faviconUrl ?? "",
              youtubeFallbacks
            )
            await savedSiteStore.update(id, { thumb: thumbBlob })
            new BroadcastChannel("url-gallery").postMessage({ type: "SITE_SAVED" })
          } catch {
            // Leave thumb as null; gallery falls back to favicon/letter placeholder.
          }
        })()
      }

      return { ok: true }
    }

    default: {
      return { ok: false, error: "Unknown message type" }
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse)
  return true // keep channel open for async response
})
