import { describe, expect, it } from "vitest"

import { computeOverview } from "@/lib/overview-stats"
import type { SavedSite } from "@/lib/store"

const NOW = 1_000_000_000_000
const DAY = 86_400_000

function site(id: number, over: Partial<SavedSite> = {}): SavedSite {
  return {
    id,
    url: `https://site${id}.example`,
    title: `Site ${id}`,
    favicon: null,
    thumb: null,
    tags: ["Docs"],
    savedAt: NOW,
    openCount: 0,
    pinned: false,
    ...over,
  }
}
const ids = (sites: SavedSite[]) => sites.map((s) => s.id)

describe("computeOverview", () => {
  it("handles an empty library", () => {
    const o = computeOverview([], NOW)
    expect(o).toMatchObject({ totalSites: 0, totalTags: 0, totalOpens: 0, savedThisWeek: 0 })
    expect(o.hero).toBeNull()
    expect(o.shelves).toEqual([])
  })

  it("counts sites, distinct tags and total opens", () => {
    const o = computeOverview(
      [site(1, { tags: ["A", "B"], openCount: 2 }), site(2, { tags: ["B"], openCount: 3 })],
      NOW
    )
    expect(o.totalSites).toBe(2)
    expect(o.totalTags).toBe(2)
    expect(o.totalOpens).toBe(5)
  })

  it("counts sites saved in the last 7 days", () => {
    const o = computeOverview(
      [
        site(1, { savedAt: NOW - 6 * DAY }),
        site(2, { savedAt: NOW - 7 * DAY }),
        site(3, { savedAt: NOW - 30 * DAY }),
      ],
      NOW
    )
    expect(o.savedThisWeek).toBe(1)
  })

  it("ranks most opened, skipping never-opened sites, ties by newest", () => {
    const o = computeOverview(
      [
        site(1, { openCount: 1, savedAt: 1 }),
        site(2, { openCount: 5 }),
        site(3, { openCount: 1, savedAt: 2 }),
        site(4),
      ],
      NOW
    )
    expect(ids(o.mostOpened)).toEqual([2, 3, 1])
    expect(o.hero?.id).toBe(2)
  })

  it("has no hero when nothing was opened", () => {
    expect(computeOverview([site(1)], NOW).hero).toBeNull()
  })

  it("caps lists at five and orders recent newest first", () => {
    const sites = Array.from({ length: 8 }, (_, i) => site(i + 1, { savedAt: i, openCount: i + 1 }))
    const o = computeOverview(sites, NOW)
    expect(ids(o.recent)).toEqual([8, 7, 6, 5, 4])
    expect(ids(o.mostOpened)).toEqual([8, 7, 6, 5, 4])
  })

  it("builds one shelf per tag, biggest first, capped but with full totals", () => {
    const sites = [
      ...Array.from({ length: 20 }, (_, i) => site(i + 1, { tags: ["Big"] })),
      site(99, { tags: ["Small", "Big"] }),
    ]
    const o = computeOverview(sites, NOW)
    expect(o.shelves.map((s) => s.tag)).toEqual(["Big", "Small"])
    expect(o.shelves[0]).toMatchObject({ total: 21 })
    expect(o.shelves[0]?.sites).toHaveLength(14)
    expect(o.shelves[1]?.total).toBe(1)
  })
})
