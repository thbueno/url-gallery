import { categorize } from "@/lib/categorizer"
import { parseMessage } from "@/lib/messages"
import { extractOgImage } from "@/lib/og-image"
import { savedSiteStore } from "@/lib/store"
import { GENERIC_OG_DOMAINS, fetchAndResize } from "@/lib/thumbnail-service"
import { getYoutubeThumbnailUrls, getYoutubeVideoId } from "@/lib/youtube"

// Bounds a single page download so one unresponsive site can't stall the
// import backfill — a per-request abort, not a background timer.
const PAGE_FETCH_TIMEOUT_MS = 10_000

// og tags live in <head>, so a prefix of the document is enough.
const PAGE_MAX_BYTES = 512 * 1024

async function readCapped(response: Response): Promise<string> {
  if (response.body === null) {
    return ""
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let html = ""
  let bytes = 0
  while (bytes < PAGE_MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    bytes += value.byteLength
    html += decoder.decode(value, { stream: true })
  }
  await reader.cancel()
  return html
}

async function fetchOgImageUrl(pageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(pageUrl, { signal: AbortSignal.timeout(PAGE_FETCH_TIMEOUT_MS) })
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
      return null
    }
    // Resolve relative URLs against the post-redirect URL.
    return extractOgImage(await readCapped(response), response.url || pageUrl)
  } catch {
    return null
  }
}

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

    case "REFRESH_THUMBNAIL": {
      // Import backfill: the imported record has no thumbnail. Re-read the page's
      // og:image (text only) and run it through the same fetch/resize path as
      // SAVE_REQUEST, falling back to YouTube's thumbnails. With no usable image
      // thumb stays null (the card shows the favicon; a later run can retry).
      // Still synchronous-per-message — no queue, no timers (ADR 0001).
      try {
        const hostname = new URL(msg.url).hostname
        const isGenericOg = GENERIC_OG_DOMAINS.some(
          (d) => hostname === d || hostname.endsWith(`.${d}`)
        )
        const imageUrl = isGenericOg ? null : await fetchOgImageUrl(msg.url)
        const youtubeVideoId = getYoutubeVideoId(msg.url)
        const youtubeUrls =
          youtubeVideoId !== undefined ? getYoutubeThumbnailUrls(youtubeVideoId) : []
        const candidates = [imageUrl, ...youtubeUrls].filter((u): u is string => Boolean(u))
        const [first, ...rest] = candidates
        if (first === undefined) {
          return { ok: true }
        }
        // Empty favicon URL: fetchAndResize throws if every candidate fails,
        // rather than storing a favicon-derived thumbnail.
        const thumbBlob = await fetchAndResize(first, "", rest)
        await savedSiteStore.update(msg.id, { thumb: thumbBlob })
        new BroadcastChannel("url-gallery").postMessage({ type: "SITE_SAVED" })
        return { ok: true }
      } catch (err) {
        return { ok: false, error: String(err) }
      }
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
