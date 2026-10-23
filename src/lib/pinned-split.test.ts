import { describe, expect, it } from "vitest"

import { splitPinned } from "@/lib/pinned-split"
import type { SavedSite } from "@/lib/store"

function site(id: number, pinned: boolean): SavedSite {
  // Only the fields the split looks at matter here.
  return { id, pinned, url: `https://example.com/${id}`, title: `Site ${id}` } as SavedSite
}

describe("splitPinned", () => {
  const sites = [1, 2, 3, 4, 5, 6].map((id) => site(id, id <= 5)).concat(site(7, false))

  it("puts the first 4 pinned sites in the strip and the rest in the grid", () => {
    const { strip, rest } = splitPinned(sites, false)
    expect(strip.map((s) => s.id)).toEqual([1, 2, 3, 4])
    expect(rest.map((s) => s.id)).toEqual([5, 6, 7])
  })

  it("keeps everything in the grid while filtering or searching", () => {
    const { strip, rest } = splitPinned(sites, true)
    expect(strip).toEqual([])
    expect(rest).toBe(sites)
  })

  it("handles no pinned sites", () => {
    const { strip, rest } = splitPinned([site(1, false)], false)
    expect(strip).toEqual([])
    expect(rest).toHaveLength(1)
  })
})
