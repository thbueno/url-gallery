import { ChevronDown, LayoutGrid, Search, X } from "lucide-react"
import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { TagInfo } from "../../types"
import { INNER, R_CHIP, SECTION } from "./shared"

const MAX_VISIBLE_TAGS = 6
/** Rough width budget per tag tab (px), plus the fixed chrome around the tab track. */
const TAB_BUDGET = 105
const CHROME_BUDGET = 134 + 16 + 16 + 8 + 150

export interface TopBarProps {
  tags: TagInfo[]
  total: number
  /** null = All */
  active: string | null
  onActive: (tag: string | null) => void
  query: string
  onQuery: (q: string) => void
  className?: string
}

function Count({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={cn(
        "grid h-5 min-w-5 place-items-center rounded-sm px-1 text-xs tabular-nums transition-colors duration-150 ease-out",
        active
          ? "bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-soft-foreground))]"
          : "text-muted-foreground"
      )}
    >
      {n}
    </span>
  )
}

const tabClass = (active: boolean) =>
  cn(
    "relative z-10 flex h-8 shrink-0 items-center gap-1.5 rounded-md pr-1.5 pl-3 text-sm font-medium outline-none",
    "transition-[color,transform] duration-150 ease-out active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-ring",
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
  )

export function TopBar({ tags, total, active, onActive, query, onQuery, className }: TopBarProps) {
  // How many tag tabs fit next to the brand and the search field; the rest go under "More".
  const rowRef = React.useRef<HTMLDivElement>(null)
  const [slots, setSlots] = React.useState(4)
  React.useLayoutEffect(() => {
    const el = rowRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const search = w >= 1024 ? 288 : 224
      const n = Math.floor((w - CHROME_BUDGET - search) / TAB_BUDGET)
      setSlots(Math.max(0, Math.min(MAX_VISIBLE_TAGS, n)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const visible = tags.slice(0, slots)
  const overflow = tags.slice(slots)
  const activeInOverflow = active !== null && overflow.some((t) => t.name === active)
  const activeKey = active === null ? "all" : activeInOverflow ? "more" : active

  // Sliding chip behind the active tab.
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [chip, setChip] = React.useState<{ x: number; w: number } | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the active tab or the tab set changes
  React.useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      const t = el.querySelector<HTMLElement>('[data-active="true"]')
      if (t) setChip({ x: t.offsetLeft, w: t.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeKey, tags])

  // "/" focuses search (unless typing somewhere).
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el?.matches("input, textarea, select, [contenteditable='true']")
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-[hsl(var(--separator))] bg-background/85 backdrop-blur-md",
        className
      )}
    >
      <div
        ref={rowRef}
        className="mx-auto flex h-16 w-full max-w-[100rem] items-center gap-4 px-5 sm:px-8"
      >
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-soft-foreground))]">
            <LayoutGrid className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Gallery</span>
        </div>

        <div
          ref={trackRef}
          role="tablist"
          aria-label="Filter by tag"
          className={cn("relative flex min-w-0 items-center gap-0.5 rounded-lg p-1", SECTION)}
        >
          {chip ? (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1 bottom-1 left-0 border border-border/70 shadow-[var(--shadow-xs)]",
                "transition-[transform,width] duration-200 ease-out motion-reduce:transition-none",
                INNER,
                R_CHIP
              )}
              style={{ width: chip.w, transform: `translateX(${chip.x}px)` }}
            />
          ) : null}
          <button
            type="button"
            role="tab"
            aria-selected={active === null}
            data-active={activeKey === "all"}
            onClick={() => onActive(null)}
            className={tabClass(activeKey === "all")}
          >
            All
            <Count n={total} active={activeKey === "all"} />
          </button>
          {visible.map((t) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={active === t.name}
              data-active={activeKey === t.name}
              onClick={() => onActive(t.name)}
              className={tabClass(activeKey === t.name)}
            >
              <span className="max-w-28 truncate">{t.name}</span>
              <Count n={t.count} active={activeKey === t.name} />
            </button>
          ))}
          {overflow.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-active={activeKey === "more"}
                  className={cn(tabClass(activeKey === "more"), "pr-2")}
                >
                  More
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 min-w-44">
                <DropdownMenuRadioGroup
                  value={active ?? ""}
                  onValueChange={(v) => onActive(v === "" ? null : v)}
                >
                  {overflow.map((t) => (
                    <DropdownMenuRadioItem key={t.name} value={t.name} className="justify-between">
                      <span className="truncate">{t.name}</span>
                      <span className="ml-4 text-xs text-muted-foreground tabular-nums">
                        {t.count}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className="relative ml-auto w-56 shrink-0 lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onQuery("")
                e.currentTarget.blur()
              }
            }}
            placeholder="Search sites"
            aria-label="Search sites"
            className="h-9 rounded-md border-border bg-background pr-9 pl-9 text-sm shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 ease-out hover:border-[hsl(var(--border-hover))]"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onQuery("")
                inputRef.current?.focus()
              }}
              className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-[0.98]"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd
              className={cn(
                "pointer-events-none absolute top-1/2 right-2 grid h-5 min-w-5 -translate-y-1/2 place-items-center rounded-sm border border-border px-1 font-sans text-xs text-muted-foreground",
                SECTION
              )}
            >
              /
            </kbd>
          )}
        </div>
      </div>
    </header>
  )
}
