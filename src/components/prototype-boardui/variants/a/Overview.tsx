import { useMemo } from "react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { VariantProps } from "../../types"
import { Bento } from "../b/Bento"
import { Shelf } from "../b/Shelves"
import { BentoSkeleton } from "../b/States"

const SHELF_LIMIT = 14

export interface OverviewProps {
  sites: SavedSite[]
  tags: VariantProps["tags"]
  totalTags: number
  loading: boolean
  openSite: VariantProps["openSite"]
  getThumbUrl: VariantProps["getThumbUrl"]
  /** "See all" on a shelf: jump to the gallery filtered by that tag. */
  onSeeAll: (tag: string) => void
  className?: string
}

/**
 * Stats dashboard page: reuses Variant B's bento tiles (hero, most opened, recently saved, stat
 * tiles) and per-tag shelves, without B's top bar. Sits inside Atelier's shell.
 */
export function Overview({
  sites,
  tags,
  totalTags,
  loading,
  openSite,
  getThumbUrl,
  onSeeAll,
  className,
}: OverviewProps) {
  const shelves = useMemo(
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

  if (loading) return <BentoSkeleton />

  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {sites.length >= 1 ? (
        <Bento sites={sites} totalTags={totalTags} openSite={openSite} getThumbUrl={getThumbUrl} />
      ) : null}
      {shelves.map((s) => (
        <Shelf
          key={s.name}
          title={s.name}
          sites={s.sites}
          onOpen={openSite}
          onSeeAll={() => onSeeAll(s.name)}
        />
      ))}
    </div>
  )
}
