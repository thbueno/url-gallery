import { describe, expect, it } from "vitest"

import { UNCATEGORIZED } from "@/lib/categorizer"
import { displayTags, normalizeTagName, toggleTag, withTag, withoutTag } from "@/lib/tags"

describe("withTag", () => {
  it("appends a new tag", () => {
    expect(withTag(["Docs"], "Design")).toEqual(["Docs", "Design"])
  })

  it("drops Uncategorized when the first real tag is added", () => {
    expect(withTag([UNCATEGORIZED], "Docs")).toEqual(["Docs"])
  })

  it("returns the same tags when the tag is already there", () => {
    const tags = ["Docs", "Design"]
    expect(withTag(tags, "Docs")).toEqual(["Docs", "Design"])
  })

  it("does not mutate its input", () => {
    const tags = [UNCATEGORIZED]
    withTag(tags, "Docs")
    expect(tags).toEqual([UNCATEGORIZED])
  })
})

describe("withoutTag", () => {
  it("removes the tag and keeps the rest", () => {
    expect(withoutTag(["Docs", "Design"], "Docs")).toEqual(["Design"])
  })

  it("falls back to Uncategorized when the last tag is removed", () => {
    expect(withoutTag(["Docs"], "Docs")).toEqual([UNCATEGORIZED])
  })

  it("leaves tags alone when the tag is not present", () => {
    expect(withoutTag(["Docs"], "Video")).toEqual(["Docs"])
  })

  it("keeps Uncategorized when asked to remove it from an Uncategorized site", () => {
    expect(withoutTag([UNCATEGORIZED], UNCATEGORIZED)).toEqual([UNCATEGORIZED])
  })
})

describe("displayTags", () => {
  it("shows Uncategorized for a site with no tags", () => {
    expect(displayTags([])).toEqual([UNCATEGORIZED])
  })

  it("returns real tags unchanged", () => {
    expect(displayTags(["Docs", "Design"])).toEqual(["Docs", "Design"])
  })
})

describe("toggleTag", () => {
  it("adds a missing tag", () => {
    expect(toggleTag([UNCATEGORIZED], "Docs")).toEqual(["Docs"])
  })

  it("removes a present tag", () => {
    expect(toggleTag(["Docs", "Design"], "Design")).toEqual(["Docs"])
  })
})

describe("normalizeTagName", () => {
  const known = ["Design", "Dev Tools"]

  it("trims and collapses whitespace", () => {
    expect(normalizeTagName("  My   tag ", known)).toBe("My tag")
  })

  it("reuses the spelling of an existing tag, ignoring case", () => {
    expect(normalizeTagName("dev tools", known)).toBe("Dev Tools")
  })

  it("rejects empty input", () => {
    expect(normalizeTagName("   ", known)).toBe("")
  })

  it("rejects Uncategorized, which is automatic", () => {
    expect(normalizeTagName("uncategorized", known)).toBe("")
  })
})
