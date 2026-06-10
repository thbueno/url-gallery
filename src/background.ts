import { categorize } from "@/lib/categorizer"
import { parseMessage } from "@/lib/messages"
import { savedSiteStore } from "@/lib/store"
import { fetchAndResize } from "@/lib/thumbnail-service"

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

      let thumbBlob: Blob | null = null
      if (msg.imageUrl || msg.faviconUrl) {
        try {
          thumbBlob = await fetchAndResize(
            msg.imageUrl ?? msg.faviconUrl ?? "",
            msg.faviconUrl ?? ""
          )
        } catch {
          thumbBlob = null
        }
      }

      const category = categorize(msg.declaredType, siteName, domain)

      await savedSiteStore.add({
        url: msg.url,
        title: msg.title,
        favicon: msg.faviconUrl ?? null,
        thumb: thumbBlob,
        category,
      })

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
