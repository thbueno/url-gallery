import { describe, expect, it } from "vitest"

import { allPinned, rangeIds, tagCountsFor } from "@/lib/bulk-selection"
import type { SavedSite } from "@/lib/store"

const site = (id: number, tags: string[], pinned = false) =>
  ({ id, tags, pinned }) as unknown as SavedSite

describe("rangeIds", () => {
  const order = [1, 2, 3, 4, 5]
  it("selects forward and backward ranges inclusively", () => {
    expect(rangeIds(order, 2, 4)).toEqual([2, 3, 4])
    expect(rangeIds(order, 4, 2)).toEqual([2, 3, 4])
  })
  it("falls back to the target with no usable anchor", () => {
    expect(rangeIds(order, null, 3)).toEqual([3])
    expect(rangeIds(order, 99, 3)).toEqual([3])
  })
  it("returns nothing when the target is not visible", () => {
    expect(rangeIds(order, 1, 99)).toEqual([])
  })
})

describe("tagCountsFor", () => {
  it("counts tags, skips the excluded one, sorts by count then name", () => {
    const sites = [site(1, ["b", "a"]), site(2, ["b", "Uncategorized"]), site(3, ["c"])]
    expect(tagCountsFor(sites, "Uncategorized")).toEqual([
      { name: "b", count: 2 },
      { name: "a", count: 1 },
      { name: "c", count: 1 },
    ])
  })
})

describe("allPinned", () => {
  it("is true only when non-empty and all pinned", () => {
    expect(allPinned([])).toBe(false)
    expect(allPinned([site(1, [], true), site(2, [], true)])).toBe(true)
    expect(allPinned([site(1, [], true), site(2, [])])).toBe(false)
  })
})
