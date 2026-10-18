import type { ComponentType } from "react"

import type { SavedSite } from "@/lib/store"

/** A tag with its site count, in display order (pinned tags first, then the user's tag order). */
export interface TagInfo {
  name: string
  /** Number of sites carrying this tag. Render with `tabular-nums`. */
  count: number
  /** True when the user pinned the tag in tag settings. */
  pinned: boolean
}

/** Aggregates derived from `sites`, precomputed so variants don't each re-derive them. */
export interface SiteStats {
  totalSites: number
  totalTags: number
  /** Sum of `openCount` over all sites. */
  totalOpens: number
  /** Sites with `savedAt` inside the last 7 days. */
  savedThisWeek: number
  /** Highest `openCount` across sites (0 if none). Handy for relative bars: `openCount / maxOpens`. */
  maxOpens: number
}

/**
 * Everything a variant receives. This data is READ-ONLY and comes from the real stores: clicking a
 * site opens its URL in a new tab, and nothing may ever be written to Dexie / chrome.storage /
 * `useGalleryStore` / `useTagSettingsStore`. Variant A (the winner) layers REAL but IN-MEMORY edits
 * (tags, pinned tags, site pins, delete, selection) on top via `editState.ts`; reloading resets
 * them. Variants B and C keep the affordances as no-ops.
 * Search, tag filtering and sorting are the variant's own job (client-side over `sites`).
 *
 * Data is real (IndexedDB via the gallery stores) and falls back to ~24 fixture sites when the
 * store is empty (`isDemo === true`). It must look good with `thumb === null` on every site
 * (favicon / letter-mark fallback) and with real thumbnails.
 *
 * Rendering context: the variant root is rendered inside a `h-dvh overflow-y-auto` container with
 * `bg-background text-foreground`. For an app shell with its own scroll regions use
 * `h-full overflow-hidden` on your root; for a page-style layout just let content flow.
 * Leave ~4rem free at the bottom-centre/bottom-right for the floating switcher + Tweaks button.
 */
export interface VariantProps {
  /**
   * All saved sites, UNFILTERED. Order: pinned first, then newest `savedAt` first.
   * SavedSite fields: `id?: number`, `url`, `title`, `favicon: string | null` (image URL),
   * `thumb: Blob | null` (don't touch directly, see getThumbUrl / SiteThumb),
   * `tags: string[]`, `savedAt: number` (ms epoch), `openCount: number`, `pinned: boolean`.
   */
  sites: SavedSite[]
  /** All tags with counts, in display order. Includes "Uncategorized" when present. */
  tags: TagInfo[]
  /** True while the real store is still loading (show skeletons). Never true in demo mode. */
  loading: boolean
  /** True when `sites` come from fixtures.ts because the real store is empty. */
  isDemo: boolean
  /** Precomputed aggregates. */
  stats: SiteStats
  /** Opens the URL in a new browser tab. Does not touch openCount. */
  openSite: (url: string) => void
  /**
   * Object URL for the site's thumbnail blob, or undefined when it has none (or it isn't ready).
   * URLs are created/revoked by the prototype shell, so never revoke them yourself.
   * Prefer `<SiteThumb site={site} />` from ./atoms; use this only for custom rendering.
   */
  getThumbUrl: (site: SavedSite) => string | undefined
}

/** Shape of each `variants/VariantX.tsx` module. */
export interface VariantModule {
  /** Display name shown in the switcher. */
  name: string
  default: ComponentType<VariantProps>
}

export type VariantKey = "A" | "B" | "C"
