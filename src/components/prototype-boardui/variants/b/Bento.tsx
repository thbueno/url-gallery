import {
  ArrowUpRight,
  CalendarPlus,
  Clock,
  Flame,
  Layers,
  MousePointerClick,
  Tag,
  Trophy,
} from "lucide-react"
import * as React from "react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { Favicon } from "../../atoms"
import { getDomain, timeAgo } from "../../helpers"
import type { VariantProps } from "../../types"
import {
  ENTER,
  INNER,
  InnerPanel,
  R_INNER,
  R_ROW,
  SECTION,
  TERTIARY,
  Tile,
  TileHeader,
  plural,
  stagger,
  useEntered,
} from "./shared"

type Props = Pick<VariantProps, "openSite" | "getThumbUrl"> & {
  /** Sites in scope (already tag-filtered). */
  sites: SavedSite[]
  totalTags: number
  className?: string
}

const rowClass = cn(
  "w-full px-2.5 py-2 text-left outline-none",
  "transition-[background-color,transform] duration-150 ease-out",
  "hover:bg-[hsl(var(--surface-hover))] active:scale-[0.98]",
  "focus-visible:ring-2 focus-visible:ring-ring",
  R_ROW
)

function Hero({
  site,
  index,
  openSite,
  getThumbUrl,
}: { site: SavedSite; index: number } & Pick<Props, "openSite" | "getThumbUrl">) {
  const thumb = getThumbUrl(site)
  return (
    <button
      type="button"
      onClick={() => openSite(site.url)}
      style={stagger(index)}
      className={cn(
        "group/hero flex h-80 flex-col rounded-card p-1.5 text-left outline-none md:col-span-2 xl:row-span-2 xl:h-auto xl:min-h-80",
        "transition-[background-color,transform] duration-200 ease-out hover:bg-[hsl(var(--surface-tertiary))] active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        SECTION,
        ENTER
      )}
    >
      <div className={cn("relative min-h-40 flex-1 overflow-hidden", R_INNER, TERTIARY)}>
        {thumb ? (
          <img
            src={thumb}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover/hero:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent-soft)),transparent_70%)]">
            <span
              className={cn(
                "grid size-24 place-items-center rounded-xl shadow-[var(--shadow-md)] transition-transform duration-300 ease-out group-hover/hero:scale-105",
                INNER
              )}
            >
              <Favicon site={site} size="xl" />
            </span>
          </div>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.08)]"
        />
        <span
          className={cn(
            "absolute top-3 left-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium shadow-[var(--shadow-xs)]",
            INNER
          )}
        >
          <Flame className="size-3.5 text-[hsl(var(--accent-soft-foreground))]" />
          Most opened
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-3 right-3 grid size-8 translate-y-1 place-items-center rounded-md opacity-0 shadow-[var(--shadow-sm)]",
            "transition-[opacity,transform] duration-200 ease-out group-hover/hero:translate-y-0 group-hover/hero:opacity-100",
            INNER
          )}
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-6 px-3.5 pt-3.5 pb-2.5">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <Favicon site={site} size="sm" />
            <h2 className="truncate text-xl font-semibold tracking-tight">{site.title}</h2>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground tabular-nums">
            {getDomain(site.url)} · Saved {timeAgo(site.savedAt)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {site.openCount.toLocaleString("en-US")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">opens</div>
        </div>
      </div>
    </button>
  )
}

function MostOpened({
  sites,
  max,
  index,
  openSite,
}: { sites: SavedSite[]; max: number; index: number } & Pick<Props, "openSite">) {
  const entered = useEntered()
  return (
    <Tile className={cn("flex flex-col xl:row-span-2", ENTER)} style={stagger(index)}>
      <TileHeader icon={Trophy} title="Most opened" aside="Top 5" />
      <InnerPanel className="flex-1">
        {sites.map((s, i) => (
          <button
            key={s.id ?? s.url}
            type="button"
            onClick={() => openSite(s.url)}
            className={cn(
              rowClass,
              "grid grid-cols-[1rem_1.25rem_minmax(0,1fr)_3rem] items-center gap-x-3"
            )}
          >
            <span className="text-xs text-muted-foreground tabular-nums">{i + 1}</span>
            <Favicon site={s} size="sm" />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate text-sm font-medium tracking-tight">{s.title}</span>
              <span className={cn("block h-1 overflow-hidden rounded-sm", TERTIARY)}>
                <span
                  className="block h-full origin-left rounded-sm bg-primary transition-transform duration-500 ease-out motion-reduce:transition-none"
                  style={{
                    width: "100%",
                    transform: `scaleX(${entered && max > 0 ? s.openCount / max : 0})`,
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </span>
            </span>
            <span className="text-right text-sm font-medium tabular-nums">
              {s.openCount.toLocaleString("en-US")}
            </span>
          </button>
        ))}
      </InnerPanel>
    </Tile>
  )
}

function Recent({
  sites,
  index,
  openSite,
}: { sites: SavedSite[]; index: number } & Pick<Props, "openSite">) {
  return (
    <Tile className={cn("flex flex-col xl:row-span-2", ENTER)} style={stagger(index)}>
      <TileHeader icon={Clock} title="Recently saved" aside="Latest 5" />
      <InnerPanel className="flex-1">
        {sites.map((s) => (
          <button
            key={s.id ?? s.url}
            type="button"
            onClick={() => openSite(s.url)}
            className={cn(
              rowClass,
              "grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3"
            )}
          >
            <Favicon site={s} size="sm" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium tracking-tight">{s.title}</span>
              <span className="truncate text-xs text-muted-foreground">{getDomain(s.url)}</span>
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{timeAgo(s.savedAt)}</span>
          </button>
        ))}
      </InnerPanel>
    </Tile>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  caption,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  caption: string
  index: number
}) {
  return (
    <Tile className={cn("flex flex-col p-5", ENTER)} style={stagger(index)}>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-7 place-items-center rounded-sm text-muted-foreground shadow-[var(--shadow-xs)]",
            INNER
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-5 text-3xl leading-none font-semibold tracking-tight tabular-nums">
        {value.toLocaleString("en-US")}
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground tabular-nums">{caption}</p>
    </Tile>
  )
}

export function Bento({ sites, totalTags, openSite, getThumbUrl, className }: Props) {
  const { byOpens, byRecent, totalOpens, savedThisWeek, pinned } = React.useMemo(() => {
    const now = Date.now()
    return {
      byOpens: [...sites].sort((a, b) => b.openCount - a.openCount || b.savedAt - a.savedAt),
      byRecent: [...sites].sort((a, b) => b.savedAt - a.savedAt),
      totalOpens: sites.reduce((n, s) => n + s.openCount, 0),
      savedThisWeek: sites.filter((s) => now - s.savedAt < 7 * 86_400_000).length,
      pinned: sites.filter((s) => s.pinned).length,
    }
  }, [sites])

  const hero = byOpens[0]
  if (!hero) return null
  const top = byOpens.slice(0, 5)
  const max = hero.openCount
  const avg = sites.length ? Math.round(totalOpens / sites.length) : 0

  return (
    <section
      aria-label="Overview"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", className)}
    >
      <Hero site={hero} index={0} openSite={openSite} getThumbUrl={getThumbUrl} />
      <MostOpened sites={top} max={max} index={1} openSite={openSite} />
      <Recent sites={byRecent.slice(0, 5)} index={2} openSite={openSite} />
      <Stat
        icon={Layers}
        label="Total sites"
        value={sites.length}
        caption={`${plural(pinned, "pinned site")}`}
        index={3}
      />
      <Stat
        icon={Tag}
        label="Tags"
        value={totalTags}
        caption={`${plural(sites.length, "site")} organised`}
        index={4}
      />
      <Stat
        icon={MousePointerClick}
        label="Total opens"
        value={totalOpens}
        caption={`${avg.toLocaleString("en-US")} per site on average`}
        index={5}
      />
      <Stat
        icon={CalendarPlus}
        label="Saved this week"
        value={savedThisWeek}
        caption="in the last 7 days"
        index={6}
      />
    </section>
  )
}
