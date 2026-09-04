import { describe, expect, it } from "vitest"

import { exportBackup, parseBackup, toAIDigest } from "@/lib/backup"

describe("toAIDigest", () => {
  it("emits a header with the site count and one markdown line per site, newest first", () => {
    const digest = toAIDigest([
      {
        url: "https://old.com",
        title: "Old",
        favicon: null,
        tags: ["A"],
        savedAt: 1,
        openCount: 0,
        pinned: false,
      },
      {
        url: "https://new.com",
        title: "New",
        favicon: null,
        tags: ["B", "C"],
        savedAt: 2,
        openCount: 0,
        pinned: false,
      },
    ])
    const lines = digest.split("\n")
    expect(lines[0]).toContain("2 saved sites")
    expect(lines[1]).toBe("- [New](https://new.com) — B, C")
    expect(lines[2]).toBe("- [Old](https://old.com) — A")
  })
})

const sampleSites = [
  {
    url: "https://example.com",
    title: "Example",
    favicon: "https://example.com/favicon.ico",
    tags: ["Dev Tools"],
    savedAt: 1_700_000_000_000,
    openCount: 3,
    pinned: true,
  },
  {
    url: "https://news.example.org/post",
    title: "A Post",
    favicon: null,
    tags: ["News", "Reading"],
    savedAt: 1_700_000_500_000,
    openCount: 0,
    pinned: false,
  },
]

describe("parseBackup", () => {
  it("rejects a file whose format marker is not url-gallery-backup", () => {
    const text = JSON.stringify({ format: "some-other-app", version: 1, sites: [] })
    expect(() => parseBackup(text)).toThrow()
  })

  it("rejects a file whose sites entries are malformed", () => {
    const text = JSON.stringify({
      format: "url-gallery-backup",
      version: 1,
      exportedAt: 0,
      sites: [{ url: "https://ok.com", title: "no tags field" }],
    })
    expect(() => parseBackup(text)).toThrow()
  })

  it("round-trips sites through exportBackup → parseBackup unchanged", () => {
    const restored = parseBackup(exportBackup(sampleSites))
    expect(restored).toEqual(sampleSites)
  })
})
