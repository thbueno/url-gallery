import { ChevronsUpDown, ListChecks, Plus, SearchX } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
import { UNCATEGORIZED, siteKey, useEditableSites } from "../editState"
import { getDomain } from "../helpers"
import type { VariantProps } from "../types"
import { BulkBar } from "./a/BulkBar"
import { Overview } from "./a/Overview"
import { type Page, Sidebar } from "./a/Sidebar"
import { SiteCard } from "./a/SiteCard"
import { TopNav } from "./a/TopNav"

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

function readPage(): Page {
  return new URLSearchParams(window.location.search).get("page") === "overview"
    ? "overview"
    : "gallery"
}

export default function VariantA({
  sites: sourceSites,
  tags: sourceTags,
  loading,
  openSite,
  getThumbUrl,
}: VariantProps) {
  const { sites, tags, stats, pinnedTags, selectMode, selected, original, actions } =
    useEditableSites({ sites: sourceSites, tags: sourceTags })

  const [page, setPageState] = useState<Page>(readPage)
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("recent")
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const lastClicked = useRef<string | null>(null)

  const setPage = useCallback((next: Page) => {
    setPageState(next)
    const url = new URL(window.location.href)
    if (next === "overview") url.searchParams.set("page", "overview")
    else url.searchParams.delete("page")
    window.history.replaceState(null, "", url)
    mainRef.current?.scrollTo({ top: 0 })
  }, [])

  // The tag chips on cards (and the thumbnail lookup of B's tiles) work on edited clones.
  const thumbFor = useCallback(
    (site: SavedSite) => getThumbUrl(original(site)),
    [getThumbUrl, original]
  )
  const availableTags = useMemo(
    () => tags.map((t) => t.name).filter((n) => n !== UNCATEGORIZED),
    [tags]
  )

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

  // Esc leaves select mode (unless a menu / dialog / input already handled it).
  useEffect(() => {
    if (!selectMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        const el = e.target
        if (el instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(el.tagName)) return
        if (document.querySelector('[role="menu"],[role="alertdialog"]')) return
        actions.exitSelect()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectMode, actions])

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

  // Visible order (pinned strip first, then grid): drives Shift-click ranges and Select all.
  const visibleKeys = useMemo(() => [...pinned, ...grid].map(siteKey), [pinned, grid])

  const handleSelect = useCallback(
    (site: SavedSite, shift: boolean) => {
      const key = siteKey(site)
      const anchor = lastClicked.current
      const a = anchor ? visibleKeys.indexOf(anchor) : -1
      const b = visibleKeys.indexOf(key)
      if (shift && a !== -1 && b !== -1) {
        const [from, to] = a < b ? [a, b] : [b, a]
        actions.setSelected([...selected, ...visibleKeys.slice(from, to + 1)])
      } else {
        actions.toggleSelected(key)
      }
      lastClicked.current = key
    },
    [visibleKeys, selected, actions]
  )

  const selectedSites = useMemo(
    () => sites.filter((s) => selected.has(siteKey(s))),
    [sites, selected]
  )
  const selectionTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of selectedSites) for (const t of s.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count
    )
  }, [selectedSites])
  const selectedKeys = useMemo(() => selectedSites.map(siteKey), [selectedSites])

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? ""
  const resultKey = `${activeTag ?? ""}|${q}|${sort}`
  const cardProps = {
    onOpen: openSite,
    availableTags,
    onToggleTag: actions.toggleTag,
    selectMode,
    onSelect: handleSelect,
  }

  const headerButton =
    "h-9 gap-2 rounded-[var(--radius-inner)] border-border bg-[hsl(var(--surface-inner))] px-3 shadow-[var(--shadow-xs)] transition-[border-color,transform] duration-150 ease-out hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--surface-inner))] active:scale-[0.98] motion-reduce:transition-none"

  return (
    <div className="flex h-full gap-3 overflow-hidden p-3">
      <Sidebar
        className="w-64 shrink-0"
        page={page}
        onPageChange={setPage}
        tags={tags}
        pinnedTags={pinnedTags}
        onTogglePinTag={actions.togglePinTag}
        totalSites={stats.totalSites}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        query={query}
        onQueryChange={(next) => {
          setQuery(next)
          if (next.trim() && page !== "gallery") setPage("gallery")
        }}
        searchRef={searchRef}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <main
          ref={mainRef}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
          className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto"
        >
          <header
            className={cn(
              "sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 bg-background/92 px-6 pt-5 pb-4 backdrop-blur-md",
              "min-[1200px]:grid-cols-[minmax(0,1fr)_minmax(0,max-content)_minmax(0,1fr)] min-[1200px]:gap-x-4",
              "shadow-[0_1px_0_0_transparent] transition-shadow duration-200 ease-out",
              scrolled && "shadow-[0_1px_0_0_hsl(var(--separator))]"
            )}
          >
            {/* Wide: Sort left, navbar truly centred, actions right (one row). Narrower than 1200px of
                window width the navbar drops to its own centred row so nothing can collide. */}
            <div className="flex min-w-0 items-center gap-2 min-[1200px]:col-start-1 min-[1200px]:row-start-1">
              {page === "gallery" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={headerButton}>
                      <span className="text-muted-foreground max-[899px]:sr-only">Sort</span>
                      {sortLabel}
                      <ChevronsUpDown
                        className="!size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuRadioGroup
                      value={sort}
                      onValueChange={(v) => setSort(v as SortKey)}
                    >
                      {SORTS.map((s) => (
                        <DropdownMenuRadioItem key={s.key} value={s.key}>
                          {s.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
            <div className="col-span-2 row-start-2 flex min-w-0 justify-center min-[1200px]:col-span-1 min-[1200px]:col-start-2 min-[1200px]:row-start-1">
              {page === "gallery" ? (
                <TopNav pinnedTags={pinnedTags} activeTag={activeTag} onTagChange={setActiveTag} />
              ) : null}
            </div>
            <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-2 min-[1200px]:col-start-3">
              {page === "gallery" ? (
                <Button
                  variant="outline"
                  aria-pressed={selectMode}
                  onClick={() => (selectMode ? actions.exitSelect() : actions.enterSelect())}
                  className={cn(
                    headerButton,
                    selectMode &&
                      "border-[hsl(var(--border-hover))] bg-[hsl(var(--surface-tertiary))] hover:bg-[hsl(var(--surface-tertiary))]"
                  )}
                >
                  <ListChecks className="!size-3.5 text-muted-foreground" aria-hidden="true" />
                  {selectMode ? "Done" : "Select"}
                </Button>
              ) : null}
              <PrimaryButton
                aria-label="Save site"
                className="h-9 gap-1.5 rounded-[var(--radius-inner)] px-3.5 max-[899px]:w-9 max-[899px]:px-0"
              >
                <Plus aria-hidden="true" />
                <span className="max-[899px]:sr-only">Save site</span>
              </PrimaryButton>
            </div>
          </header>

          <div className="px-6 pt-2 pb-40">
            {page === "overview" ? (
              <div
                key="overview"
                className="animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none"
              >
                <Overview
                  sites={sites}
                  tags={tags}
                  totalTags={stats.totalTags}
                  loading={loading}
                  openSite={openSite}
                  getThumbUrl={thumbFor}
                  onSeeAll={(tag) => {
                    setActiveTag(tag)
                    setPage("gallery")
                  }}
                />
              </div>
            ) : loading ? (
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
                        <SiteCard
                          key={siteKey(s)}
                          site={s}
                          size="feature"
                          selected={selected.has(siteKey(s))}
                          {...cardProps}
                        />
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
                        <SiteCard
                          key={siteKey(s)}
                          site={s}
                          selected={selected.has(siteKey(s))}
                          {...cardProps}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </div>
        </main>

        {/* Bulk bar floats above the (bottom-centre) variant switcher, centred over the canvas. */}
        {selectMode && page === "gallery" ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-[4.5rem] z-30 flex justify-center px-4">
            <BulkBar
              className="pointer-events-auto"
              count={selectedSites.length}
              visibleCount={visibleKeys.length}
              availableTags={availableTags}
              selectionTags={selectionTags}
              allSelectedPinned={selectedSites.length > 0 && selectedSites.every((s) => s.pinned)}
              onAddTag={(tag) => actions.addTagTo(selectedKeys, tag)}
              onRemoveTag={(tag) => actions.removeTagFrom(selectedKeys, tag)}
              onTogglePin={() =>
                actions.setPinned(selectedKeys, !selectedSites.every((s) => s.pinned))
              }
              onDelete={() => actions.deleteSites(selectedKeys)}
              onSelectAll={() => actions.setSelected(visibleKeys)}
              onCancel={actions.exitSelect}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
