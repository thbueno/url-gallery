import { Bookmark, LayoutGrid, Moon, Search, Sun } from "lucide-react"
import { type Ref, useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import type { TagInfo } from "../../types"

export interface SidebarProps {
  tags: TagInfo[]
  totalSites: number
  /** null = "All sites". */
  activeTag: string | null
  onTagChange: (tag: string | null) => void
  query: string
  onQueryChange: (q: string) => void
  searchRef: Ref<HTMLInputElement>
  className?: string
}

const rowBase = [
  "group/row flex w-full items-center gap-2.5 rounded-[var(--radius-inner)] border border-transparent px-2.5 py-1.5 text-left text-sm font-medium",
  "transition-[background-color,color,box-shadow,border-color,transform] duration-150 ease-out active:scale-[0.98]",
  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
]

function NavRow({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean
  icon?: React.ReactNode
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        rowBase,
        active
          ? "border-border bg-[hsl(var(--surface-inner))] text-foreground shadow-[var(--shadow-xs)]"
          : "text-muted-foreground hover:bg-[hsl(var(--surface-tertiary)/0.6)] hover:text-foreground"
      )}
    >
      {icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={cn(
          "shrink-0 text-xs font-normal tabular-nums transition-colors duration-150",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  )
}

function readIsDark(): boolean {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--background")
  const lightness = Number.parseFloat(raw.trim().split(/\s+/)[2] ?? "100")
  return lightness < 50
}

/** Reads light/dark from the live --background token so the (read-only) toggle mirrors Tweaks. */
function useIsDark(): boolean {
  const [dark, setDark] = useState(readIsDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(readIsDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] })
    return () => obs.disconnect()
  }, [])
  return dark
}

function ThemeSegment() {
  const dark = useIsDark()
  const item = (active: boolean) =>
    cn(
      "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium",
      "transition-[background-color,color,box-shadow] duration-150 ease-out",
      active
        ? "bg-[hsl(var(--surface-inner))] text-foreground shadow-[var(--shadow-2xs)]"
        : "text-muted-foreground"
    )
  return (
    <div
      className="flex gap-0.5 rounded-[var(--radius-inner)] bg-[hsl(var(--surface-tertiary))] p-0.5"
      title="Switch theme in Tweaks"
    >
      <button type="button" className={item(!dark)} aria-pressed={!dark} tabIndex={-1}>
        <Sun className="size-3.5" aria-hidden="true" />
        Light
      </button>
      <button type="button" className={item(dark)} aria-pressed={dark} tabIndex={-1}>
        <Moon className="size-3.5" aria-hidden="true" />
        Dark
      </button>
    </div>
  )
}

export function Sidebar({
  tags,
  totalSites,
  activeTag,
  onTagChange,
  query,
  onQueryChange,
  searchRef,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col gap-3 rounded-card bg-[hsl(var(--surface-section))] p-1.5",
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-2.5 pt-2.5">
        <span className="flex size-7 items-center justify-center rounded-md bg-[linear-gradient(180deg,hsl(var(--primary-gradient-from)),hsl(var(--primary-gradient-to)))] text-primary-foreground shadow-[var(--shadow-primary)]">
          <Bookmark className="size-3.5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold tracking-[-0.01em]">URL Gallery</span>
      </div>

      <label className="group/search relative block">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onQueryChange("")
              e.currentTarget.blur()
            }
          }}
          placeholder="Search sites"
          aria-label="Search sites"
          className={cn(
            "h-9 w-full rounded-[var(--radius-inner)] border border-border bg-[hsl(var(--surface-inner))] pr-12 pl-8 text-sm shadow-[var(--shadow-xs)]",
            "placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
            "transition-[border-color,box-shadow] duration-150 ease-out outline-none",
            "hover:border-[hsl(var(--border-hover))] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          )}
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5 rounded-sm bg-[hsl(var(--surface-tertiary))] px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium leading-none text-muted-foreground">
          <span aria-hidden="true">⌘</span>K
        </kbd>
      </label>

      <nav
        aria-label="Tags"
        className="scrollbar-minimal -mx-0.5 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-0.5"
      >
        <NavRow
          active={activeTag === null}
          icon={<LayoutGrid className="size-4" />}
          label="All sites"
          count={totalSites}
          onClick={() => onTagChange(null)}
        />
        <p className="px-2.5 pt-4 pb-1.5 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
          Tags
        </p>
        {tags.map((t) => (
          <NavRow
            key={t.name}
            active={activeTag === t.name}
            icon={<span className="size-1.5 rounded-full bg-current opacity-40" />}
            label={t.name}
            count={t.count}
            onClick={() => onTagChange(activeTag === t.name ? null : t.name)}
          />
        ))}
      </nav>

      <div className="px-0.5 pb-0.5">
        <ThemeSegment />
      </div>
    </aside>
  )
}
