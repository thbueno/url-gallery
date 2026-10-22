import { describe, expect, it } from "vitest"

import { sortSites } from "@/lib/sort-sites"
import type { SavedSite } from "@/lib/store"

function site(id: number, over: Partial<SavedSite> = {}): SavedSite {
  return {
    id,
    url: `https://site${id}.example`,
    title: `Site ${id}`,
    favicon: null,
    thumb: null,
    tags: ["Uncategorized"],
    savedAt: 0,
    openCount: 0,
    pinned: false,
    ...over,
  }
}

const ids = (sites: SavedSite[]) => sites.map((s) => s.id)

describe("sortSites", () => {
  it("'savedAt' lists the most recently saved first", () => {
    const sites = [site(1, { savedAt: 100 }), site(2, { savedAt: 300 }), site(3, { savedAt: 200 })]
    expect(ids(sortSites(sites, "savedAt"))).toEqual([2, 3, 1])
  })

  it("'openCount' lists the most opened first", () => {
    const sites = [site(1, { openCount: 1 }), site(2, { openCount: 9 }), site(3, { openCount: 4 })]
    expect(ids(sortSites(sites, "openCount"))).toEqual([2, 3, 1])
  })

  it("'openCount' breaks ties by most recently saved", () => {
    const sites = [
      site(1, { openCount: 5, savedAt: 100 }),
      site(2, { openCount: 5, savedAt: 300 }),
      site(3, { openCount: 5, savedAt: 200 }),
    ]
    expect(ids(sortSites(sites, "openCount"))).toEqual([2, 3, 1])
  })

  it("keeps pinned sites first in either order", () => {
    const sites = [
      site(1, { savedAt: 300, openCount: 9 }),
      site(2, { savedAt: 100, openCount: 1, pinned: true }),
      site(3, { savedAt: 200, openCount: 5 }),
    ]
    expect(ids(sortSites(sites, "savedAt"))).toEqual([2, 1, 3])
    expect(ids(sortSites(sites, "openCount"))).toEqual([2, 1, 3])
  })

  it("does not mutate its input", () => {
    const sites = [site(1, { savedAt: 1 }), site(2, { savedAt: 2 })]
    sortSites(sites, "savedAt")
    expect(ids(sites)).toEqual([1, 2])
  })
})
