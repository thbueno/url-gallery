import { Search } from "lucide-react"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { VariantProps } from "../types"
import { IndexList } from "./c/IndexList"
import { Inspector, InspectorEmpty, InspectorSkeleton } from "./c/Inspector"
import { Rail } from "./c/Rail"
import {
  NATURAL_DIR,
  type SortKey,
  type SortState,
  matchesQuery,
  siteKey,
  sortSites,
} from "./c/shared"

export const name = "Index"

/** True when the key event came from somewhere the user is typing. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

export default function VariantC({ sites, tags, loading, stats, openSite }: VariantProps) {
  const [query, setQuery] = React.useState("")
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<SortState | null>(null)
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)

  const visible = React.useMemo(() => {
    const filtered = sites.filter(
      (s) => (activeTag === null || s.tags.includes(activeTag)) && matchesQuery(s, query)
    )
    return sortSites(filtered, sort)
  }, [sites, activeTag, query, sort])

  // The selection falls back to the first visible row whenever it is filtered out.
  const selected = visible.find((s) => siteKey(s) === selectedKey) ?? visible[0]
  const effectiveKey = selected ? siteKey(selected) : null

  const onSort = React.useCallback((key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: NATURAL_DIR[key] }
      if (prev.dir === NATURAL_DIR[key]) return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      return null // third click returns to the default order
    })
  }, [])

  const move = React.useCallback(
    (delta: number) => {
      if (visible.length === 0) return
      const idx = visible.findIndex((s) => siteKey(s) === effectiveKey)
      const next = visible[Math.min(visible.length - 1, Math.max(0, idx + delta))]
      if (next) setSelectedKey(siteKey(next))
    },
    [visible, effectiveKey]
  )

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault()
          move(1)
          break
        case "k":
        case "ArrowUp":
          e.preventDefault()
          move(-1)
          break
        case "Enter": {
          // let a focused button / link keep its own Enter behaviour
          const el = e.target instanceof HTMLElement ? e.target.closest("button,a") : null
          if (el || !selected) return
          e.preventDefault()
          openSite(selected.url)
          break
        }
        case "/":
          e.preventDefault()
          searchRef.current?.focus()
          break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [move, selected, openSite])

  const heading = activeTag ?? "All sites"
  const hasFilters = activeTag !== null || query.trim() !== ""

  return (
    <div className="flex h-full gap-2 overflow-hidden bg-background p-2 text-foreground">
      <Rail
        tags={tags}
        totalSites={stats.totalSites}
        activeTag={activeTag}
        loading={loading}
        onSelectTag={setActiveTag}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-3 pb-3 pt-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-balance text-lg font-medium leading-none">{heading}</h1>
            {loading ? (
              <Skeleton className="h-4 w-6" />
            ) : (
              <span className="text-sm tabular-nums text-muted-foreground">{visible.length}</span>
            )}
          </div>
          <div className="relative w-64 shrink-0">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Search sites"
              aria-label="Search sites"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setQuery("")
                  e.currentTarget.blur()
                } else if (e.key === "ArrowDown" || e.key === "Enter") {
                  e.preventDefault()
                  e.currentTarget.blur()
                }
              }}
              className={cn(
                "h-9 rounded-lg border border-transparent bg-[hsl(var(--surface-tertiary))] pl-9 pr-3 text-sm shadow-none transition-[border-color,box-shadow] duration-150 ease-out",
                "hover:border-[hsl(var(--border-hover))] focus-visible:ring-2 focus-visible:ring-ring",
                "[&::-webkit-search-cancel-button]:hidden"
              )}
            />
          </div>
        </header>

        <IndexList
          className="min-h-0 flex-1"
          sites={visible}
          loading={loading}
          selectedKey={effectiveKey}
          sort={sort}
          maxOpens={stats.maxOpens}
          hasFilters={hasFilters}
          query={query}
          onSort={onSort}
          onSelect={setSelectedKey}
          onOpen={openSite}
          onClearFilters={() => {
            setQuery("")
            setActiveTag(null)
          }}
        />
      </main>

      {loading ? (
        <InspectorSkeleton className="hidden w-[22rem] shrink-0 md:block" />
      ) : selected ? (
        <Inspector
          className="hidden w-[22rem] shrink-0 md:block"
          site={selected}
          maxOpens={stats.maxOpens}
          onOpen={openSite}
          onSelectTag={setActiveTag}
        />
      ) : (
        <InspectorEmpty className="hidden w-[22rem] shrink-0 md:flex" />
      )}
    </div>
  )
}
