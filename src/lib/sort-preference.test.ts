import { describe, expect, it } from "vitest"

import { loadSortOrder, saveSortOrder } from "@/lib/sort-preference"
import { isSortOrder } from "@/lib/sort-sites"

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const throwingStorage = {
  getItem: () => {
    throw new Error("blocked")
  },
  setItem: () => {
    throw new Error("blocked")
  },
}

describe("isSortOrder", () => {
  it("accepts the known orders only", () => {
    expect(isSortOrder("savedAt")).toBe(true)
    expect(isSortOrder("openCount")).toBe(true)
    expect(isSortOrder("title")).toBe(false)
    expect(isSortOrder(null)).toBe(false)
    expect(isSortOrder(3)).toBe(false)
  })
})

describe("sort preference", () => {
  it("defaults to recently saved when nothing is stored", () => {
    expect(loadSortOrder(() => fakeStorage())).toBe("savedAt")
  })

  it("round-trips a saved choice", () => {
    const storage = fakeStorage()
    saveSortOrder("openCount", () => storage)
    expect(loadSortOrder(() => storage)).toBe("openCount")
  })

  it("ignores a stored value that is not a known order", () => {
    expect(loadSortOrder(() => fakeStorage({ "url-gallery-sort": "bogus" }))).toBe("savedAt")
  })

  it("survives storage that throws on access, read or write", () => {
    expect(loadSortOrder(() => throwingStorage)).toBe("savedAt")
    expect(() => saveSortOrder("openCount", () => throwingStorage)).not.toThrow()
    expect(
      loadSortOrder(() => {
        throw new Error("no storage")
      })
    ).toBe("savedAt")
  })
})
