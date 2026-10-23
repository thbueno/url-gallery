import { describe, expect, it } from "vitest"

import { exportBackup, parseBackup, toAIDigest } from "@/lib/backup"

describe("toAIDigest", () => {
  it("emits a header with the site count and one markdown line per site, newest first", () => {
    const digest = toAIDigest([
      {
        url: "https://old.com",
        title: "Old",
        tags: ["A"],
        savedAt: 1,
      },
      {
        url: "https://new.com",
        title: "New",
        tags: ["B", "C"],
        savedAt: 2,
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
    thumb: "data:image/webp;base64,UklGRg==",
    tags: ["Dev Tools"],
    savedAt: 1_700_000_000_000,
    openCount: 3,
    pinned: true,
  },
  {
    url: "https://news.example.org/post",
    title: "A Post",
    favicon: null,
    thumb: null,
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

  it("still parses a v1 file, giving each site thumb null and no tag settings", () => {
    const v1Text = `{
  "format": "url-gallery-backup",
  "version": 1,
  "exportedAt": 1700000000000,
  "sites": [
    {
      "url": "https://example.com",
      "title": "Example",
      "favicon": "https://example.com/favicon.ico",
      "tags": ["Dev Tools"],
      "savedAt": 1700000000000,
      "openCount": 3,
      "pinned": true
    }
  ]
}`
    expect(parseBackup(v1Text)).toEqual({
      sites: [
        {
          url: "https://example.com",
          title: "Example",
          favicon: "https://example.com/favicon.ico",
          thumb: null,
          tags: ["Dev Tools"],
          savedAt: 1_700_000_000_000,
          openCount: 3,
          pinned: true,
        },
      ],
      tagSettings: null,
    })
  })

  it("round-trips sites, thumbnails and tag settings through exportBackup → parseBackup", () => {
    const tagSettings = {
      pinnedTags: ["Dev Tools"],
      customTags: ["Reading"],
      tagOrder: ["Reading", "Dev Tools", "News"],
    }
    const restored = parseBackup(exportBackup(sampleSites, tagSettings))
    expect(restored).toEqual({ sites: sampleSites, tagSettings })
  })
})
