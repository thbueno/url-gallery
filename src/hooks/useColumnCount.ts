import { useEffect, useState } from "react"

export const MIN_CARD_WIDTH = 220 // px — matches --card-min-width token (14rem ≈ 224px)
export const CARD_GAP = 24 // px — gap-6, mirrors --gallery-gap

/** Column count that fits the container's current width. 0 until first measured. */
export function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>): number {
  const [cols, setCols] = useState(0)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const w = entry.contentRect.width
      setCols(Math.max(1, Math.floor((w + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP))))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])
  return cols
}
