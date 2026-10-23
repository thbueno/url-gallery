import { CalendarPlusIcon, LayersIcon, MousePointerClickIcon, TagIcon } from "lucide-react"

import { OverviewEmptyState } from "@/components/overview/OverviewEmptyState"
import { OverviewHero } from "@/components/overview/OverviewHero"
import { OverviewRow } from "@/components/overview/OverviewRow"
import { OverviewSkeleton } from "@/components/overview/OverviewSkeleton"
import { OverviewTile } from "@/components/overview/OverviewTile"
import { StatTile } from "@/components/overview/StatTile"
import { TagShelf } from "@/components/overview/TagShelf"
import { timeAgo } from "@/lib/format"
import type { OverviewStats } from "@/lib/overview-stats"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OverviewPageProps {
  /** Null while loading. */
  stats: OverviewStats | null
  onOpenSite: (site: SavedSite) => void
  /** "See all" on a shelf: go to the gallery filtered by that tag. */
  onSeeAll: (tag: string) => void
  className?: string
}

/** The Overview page: headline numbers, rankings and one shelf per Tag. */
export function OverviewPage({ stats, onOpenSite, onSeeAll, className }: OverviewPageProps) {
  if (!stats) return <OverviewSkeleton className={className} />
  if (stats.totalSites === 0) return <OverviewEmptyState className={className} />

  const top = stats.mostOpened[0]?.openCount ?? 0

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile icon={<LayersIcon />} label="Saved sites" value={stats.totalSites} />
        <StatTile icon={<TagIcon />} label="Tags" value={stats.totalTags} />
        <StatTile icon={<MousePointerClickIcon />} label="Total opens" value={stats.totalOpens} />
        <StatTile
          icon={<CalendarPlusIcon />}
          label="Saved this week"
          value={stats.savedThisWeek}
          caption="in the last 7 days"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {stats.hero ? <OverviewHero site={stats.hero} onOpen={onOpenSite} /> : null}
        {stats.hero ? (
          <OverviewTile title="Most opened" aside="Top 5">
            {stats.mostOpened.map((site, i) => (
              <OverviewRow
                key={site.id ?? site.url}
                site={site}
                rank={i + 1}
                share={top > 0 ? site.openCount / top : 0}
                onOpen={onOpenSite}
              />
            ))}
          </OverviewTile>
        ) : null}
        <OverviewTile
          title="Recently saved"
          aside="Latest 5"
          className={stats.hero ? undefined : "xl:col-span-3"}
        >
          {stats.recent.map((site) => (
            <OverviewRow
              key={site.id ?? site.url}
              site={site}
              trailing={timeAgo(site.savedAt)}
              onOpen={onOpenSite}
            />
          ))}
        </OverviewTile>
      </div>

      {stats.shelves.map((shelf) => (
        <TagShelf
          key={shelf.tag}
          tag={shelf.tag}
          total={shelf.total}
          sites={shelf.sites}
          onOpen={onOpenSite}
          onSeeAll={onSeeAll}
        />
      ))}
    </div>
  )
}
