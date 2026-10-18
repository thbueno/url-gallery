import { ChevronsUpDown, Plus, SearchX } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "../atoms"
import { compact, getDomain } from "../helpers"
import type { VariantProps } from "../types"
import { Sidebar } from "./a/Sidebar"
import { SiteCard } from "./a/SiteCard"

export const name = "Atelier"

type SortKey = "recent" | "opened" | "alpha"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently saved" },
  { key: "opened", label: "Most opened" },
  { key: "alpha", label: "A to Z" },
]

const FEATURE_GRID = "grid grid-cols-2 gap-3 min-[1100px]:grid-cols-4"
const SITE_GRID = "grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3"

function sortSites(sites: SavedSite[], sort: SortKey): SavedSite[] {
  const copy = [...sites]
  if (sort === "recent") return copy.sort((a, b) => b.savedAt - a.savedAt)
  if (sort === "opened")
    return copy.sort((a, b) => b.openCount - a.openCount || b.savedAt - a.savedAt)
  return copy.sort((a, b) => a.title.localeCompare(b.title))
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="mb-3 flex items-baseline gap-2 px-1">
      <h2 className="text-sm font-medium tracking-[-0.01em]">{children}</h2>
      {count !== undefined ? (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      ) : null}
    </div>
  )
}

function SkeletonCard({ feature }: { feature?: boolean }) {
  return (
    <div className="flex flex-col rounded-card bg-[hsl(var(--surface-section))] p-1.5">
      <Skeleton className="aspect-[16/10] w-full rounded-[var(--radius-inner)] bg-[hsl(var(--surface-tertiary))]" />
      <div className="flex flex-col gap-2 px-2 pt-3 pb-2.5">
        <Skeleton className={cn("h-4 w-3/4 bg-[hsl(var(--surface-tertiary))]", feature && "h-5")} />
        <Skeleton className="h-3 w-1/2 bg-[hsl(var(--surface-tertiary))]" />
      </div>
    </div>
  )
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-card bg-[hsl(var(--surface-section))] px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-[hsl(var(--surface-inner))] text-muted-foreground shadow-[var(--shadow-sm)]">
        <SearchX className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-5 max-w-sm text-balance text-base font-medium tracking-[-0.01em]">
        {query ? `Nothing matches “${query}”` : "Nothing here yet"}
      </h2>
      <p className="mt-1.5 max-w-xs text-pretty text-sm text-muted-foreground">
        Try a different word, or browse another tag from the sidebar.
      </p>
      {query ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="mt-5 border-border bg-[hsl(var(--surface-inner))] shadow-[var(--shadow-xs)] transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          Clear search
        </Button>
      ) : null}
    </div>
  )
}

export default function VariantA({ sites, tags, loading, stats, openSite }: VariantProps) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("recent")
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K and "/" focus the search field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const q = query.trim().toLowerCase()
  const filtering = q !== "" || activeTag !== null

  const filtered = useMemo(() => {
    const out = sites.filter((s) => {
      if (activeTag && !s.tags.includes(activeTag)) return false
      if (!q) return true
      return (
        s.title.toLowerCase().includes(q) ||
        getDomain(s.url).toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
    return sortSites(out, sort)
  }, [sites, activeTag, q, sort])

  // The Pinned strip only shows on the unfiltered view; those cards are not repeated in the grid.
  const pinned = useMemo(
    () => (filtering ? [] : sites.filter((s) => s.pinned).slice(0, 4)),
    [sites, filtering]
  )
  const grid = useMemo(() => {
    if (pinned.length === 0) return filtered
    const shown = new Set(pinned)
    return filtered.filter((s) => !shown.has(s))
  }, [filtered, pinned])

  const title = activeTag ?? "Gallery"
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? ""
  const resultKey = `${activeTag ?? ""}|${q}|${sort}`

  return (
    <div className="flex h-full gap-3 overflow-hidden p-3">
      <Sidebar
        className="w-64 shrink-0"
        tags={tags}
        totalSites={stats.totalSites}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        query={query}
        onQueryChange={setQuery}
        searchRef={searchRef}
      />

      <main
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        className="scrollbar-minimal min-w-0 flex-1 overflow-y-auto"
      >
        <header
          className={cn(
            "sticky top-0 z-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 bg-background/92 px-6 pt-5 pb-4 backdrop-blur-md",
            "shadow-[0_1px_0_0_transparent] transition-shadow duration-200 ease-out",
            scrolled && "shadow-[0_1px_0_0_hsl(var(--separator))]"
          )}
        >
          <div className="min-w-0">
            <h1 className="truncate text-balance text-2xl font-semibold tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              {loading
                ? "Loading your sites"
                : `${filtered.length} ${filtered.length === 1 ? "site" : "sites"} · ${compact(stats.totalOpens)} opens`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 gap-2 rounded-[var(--radius-inner)] border-border bg-[hsl(var(--surface-inner))] px-3 shadow-[var(--shadow-xs)] transition-[border-color,transform] duration-150 ease-out hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--surface-inner))] active:scale-[0.98] motion-reduce:transition-none"
                >
                  <span className="text-muted-foreground">Sort</span>
                  {sortLabel}
                  <ChevronsUpDown className="!size-3.5 text-muted-foreground" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  {SORTS.map((s) => (
                    <DropdownMenuRadioItem key={s.key} value={s.key}>
                      {s.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <PrimaryButton className="h-9 gap-1.5 rounded-[var(--radius-inner)] px-3.5">
              <Plus aria-hidden="true" />
              Save site
            </PrimaryButton>
          </div>
        </header>

        <div className="px-6 pt-2 pb-24">
          {loading ? (
            <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading sites">
              <div className={FEATURE_GRID}>
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonCard key={i} feature />
                ))}
              </div>
              <div className={SITE_GRID}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState query={query.trim()} onClear={() => setQuery("")} />
          ) : (
            <div
              key={resultKey}
              className="flex flex-col gap-9 animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none"
            >
              {pinned.length > 0 ? (
                <section aria-label="Pinned">
                  <SectionLabel count={pinned.length}>Pinned</SectionLabel>
                  <div className={FEATURE_GRID}>
                    {pinned.map((s) => (
                      <SiteCard key={s.id ?? s.url} site={s} size="feature" onOpen={openSite} />
                    ))}
                  </div>
                </section>
              ) : null}
              {grid.length > 0 ? (
                <section aria-label="All sites">
                  <SectionLabel count={grid.length}>
                    {pinned.length > 0 ? "All sites" : filtering ? "Results" : "All sites"}
                  </SectionLabel>
                  <div className={SITE_GRID}>
                    {grid.map((s) => (
                      <SiteCard key={s.id ?? s.url} site={s} onOpen={openSite} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
