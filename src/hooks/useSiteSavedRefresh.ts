import { useEffect } from "react"

import { parseMessage } from "@/lib/messages"

/** Calls `load` whenever another extension page (e.g. the popup) saves a site. */
export function useSiteSavedRefresh(load: () => void | Promise<void>): void {
  useEffect(() => {
    const channel = new BroadcastChannel("url-gallery")
    channel.onmessage = (event) => {
      try {
        if (parseMessage(event.data).type === "SITE_SAVED") load()
      } catch {
        // ignore messages this tab doesn't care about
      }
    }
    return () => channel.close()
  }, [load])
}
