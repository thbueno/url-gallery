import { Plus } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

import { PrimaryButton } from "../atoms"
import type { VariantProps } from "../types"
import { Bento } from "./b/Bento"
import { Shelf } from "./b/Shelves"
import { SiteCard } from "./b/SiteCard"
import { BentoSkeleton, EmptyState, GridSkeleton } from "./b/States"
import { TopBar } from "./b/TopBar"
import { SECTION, matchesQuery, plural } from "./b/shared"

export const name = "Bento"

const SHELF_LIMIT = 14

/** "Bento": no sidebar, usage-driven dashboard. Hierarchy comes from openCount and savedAt. */
export default function VariantB({
  sites,
  tags,
  loading,
  isDemo,
  stats,
  openSite,
  getThumbUrl,
}: VariantProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState("")
  const [tag, setTag] = React.useState<string | null>(null)
  const q = query.trim().toLowerCase()

  const scoped = React.useMemo(
    () => (tag === null ? sites : sites.filter((s) => s.tags.includes(tag))),
    [sites, tag]
  )
  const results = React.useMemo(
    () => (q ? scoped.filter((s) => matchesQuery(s, q)) : scoped),
    [scoped, q]
  )

  const selectTag = React.useCallback((next: string | null) => {
    setTag(next)
    rootRef.current?.parentElement?.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const shelves = React.useMemo(
    () =>
      tags
        .map((t) => ({
          name: t.name,
          sites: sites
            .filter((s) => s.tags.includes(t.name))
            .sort((a, b) => b.openCount - a.openCount || b.savedAt - a.savedAt)
            .slice(0, SHELF_LIMIT),
        }))
        .filter((s) => s.sites.length > 0),
    [sites, tags]
  )

  const searching = q.length > 0
  const dashboard = !searching
  const title = searching ? "Search results" : (tag ?? "Overview")
  const subtitle = searching
    ? `${plural(results.length, "site")} matching “${query.trim()}”${tag ? ` in ${tag}` : ""}`
    : tag
      ? plural(scoped.length, "site")
      : `${plural(stats.totalSites, "site")} across ${plural(stats.totalTags, "tag")}`

  return (
    <div ref={rootRef} className="min-h-full bg-background text-foreground">
      <TopBar
        tags={tags}
        total={stats.totalSites}
        active={tag}
        onActive={selectTag}
        query={query}
        onQuery={setQuery}
      />

      <main className="mx-auto w-full max-w-[100rem] px-5 pt-8 pb-24 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-3xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
              {isDemo ? (
                <span
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums",
                    SECTION
                  )}
                >
                  Demo data
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 truncate text-sm text-muted-foreground tabular-nums">
              {loading ? "Loading your sites…" : subtitle}
            </p>
          </div>
          <PrimaryButton className="shrink-0" onClick={() => {}}>
            <Plus />
            Save site
          </PrimaryButton>
        </div>

        {loading ? (
          dashboard ? (
            <BentoSkeleton />
          ) : (
            <GridSkeleton />
          )
        ) : results.length === 0 ? (
          <EmptyState
            query={query.trim()}
            tag={tag}
            noSites={sites.length === 0}
            onClear={() => {
              setQuery("")
              setTag(null)
            }}
          />
        ) : searching ? (
          <ResultsGrid sites={results} onOpen={openSite} />
        ) : (
          <div className="flex flex-col gap-12">
            {scoped.length >= 3 ? (
              <Bento
                sites={scoped}
                totalTags={
                  tag === null ? stats.totalTags : new Set(scoped.flatMap((s) => s.tags)).size
                }
                openSite={openSite}
                getThumbUrl={getThumbUrl}
              />
            ) : null}
            {tag === null ? (
              shelves.map((s) => (
                <Shelf
                  key={s.name}
                  title={s.name}
                  sites={s.sites}
                  onOpen={openSite}
                  onSeeAll={() => selectTag(s.name)}
                />
              ))
            ) : (
              <section aria-label={`All sites in ${tag}`}>
                <h2 className="mb-3 text-lg font-semibold tracking-tight text-balance">
                  All sites
                </h2>
                <ResultsGrid sites={scoped} onOpen={openSite} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function ResultsGrid({
  sites,
  onOpen,
}: { sites: VariantProps["sites"]; onOpen: VariantProps["openSite"] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
      {sites.map((s) => (
        <SiteCard key={s.id ?? s.url} site={s} onOpen={onOpen} />
      ))}
    </div>
  )
}
