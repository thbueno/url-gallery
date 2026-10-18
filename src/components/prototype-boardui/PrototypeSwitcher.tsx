import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useEffect } from "react"

import { cn } from "@/lib/utils"

import type { VariantKey } from "./types"

export interface SwitcherItem {
  key: VariantKey
  name: string
}

interface PrototypeSwitcherProps {
  items: SwitcherItem[]
  value: VariantKey
  onChange: (key: VariantKey) => void
  className?: string
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

/**
 * Floating prototype-tool pill. Deliberately NOT themed like the design: it is an inverted
 * foreground-on-background high-contrast pill so it reads as tooling, not as part of the UI.
 * Parent positions it.
 */
export function PrototypeSwitcher({ items, value, onChange, className }: PrototypeSwitcherProps) {
  const index = Math.max(
    0,
    items.findIndex((i) => i.key === value)
  )
  const current = items[index]

  function step(delta: number) {
    const next = items[(index + delta + items.length) % items.length]
    if (next) onChange(next.key)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || isTyping(e.target)) return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        step(-1)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        step(1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const btn =
    "flex size-7 items-center justify-center rounded-full text-background/70 outline-none transition-[background-color,color,transform] duration-150 ease-out hover:bg-background/15 hover:text-background focus-visible:ring-2 focus-visible:ring-background/60 active:scale-95"

  return (
    <div
      role="toolbar"
      aria-label="Prototype variant switcher"
      className={cn(
        "flex items-center gap-1 rounded-full bg-foreground p-1 font-sans text-background shadow-[0_8px_24px_-6px_rgb(0_0_0/0.45)] ring-1 ring-background/20",
        className
      )}
    >
      <button type="button" className={btn} aria-label="Previous variant" onClick={() => step(-1)}>
        <ChevronLeftIcon className="size-4" />
      </button>
      <div className="flex min-w-36 items-baseline justify-center gap-2 px-1 text-sm font-medium">
        <span className="font-mono text-xs text-background/60 tabular-nums">
          {current?.key} / {items.length}
        </span>
        <span>{current?.name}</span>
      </div>
      <button type="button" className={btn} aria-label="Next variant" onClick={() => step(1)}>
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  )
}
