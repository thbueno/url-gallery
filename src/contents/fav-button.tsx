import { Bookmark, BookmarkCheck } from "lucide-react"
import type { PlasmoCSConfig } from "plasmo"
import { useState } from "react"

import { extractMetadata } from "@/lib/metadata-extractor"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

export default function FavButton() {
  const [saved, setSaved] = useState(false)

  async function handleClick() {
    const { imageUrl, faviconUrl, title, type } = extractMetadata(document)

    await chrome.runtime.sendMessage({
      type: "SAVE_REQUEST",
      url: location.href,
      title: title ?? location.href,
      imageUrl,
      faviconUrl,
      declaredType: type,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 2147483647,
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: saved ? "#22c55e" : "#27272a",
        color: "#ffffff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
      title={saved ? "Saved!" : "Save to URL Gallery"}
    >
      {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
    </button>
  )
}
