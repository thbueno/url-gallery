// @vitest-environment node
import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it } from "vitest"

// We'll import these after the implementation exists.
// For now, the tests are written to define the contract.
import { savedSiteStore } from "@/lib/store"

describe("SavedSiteStore", () => {
  beforeEach(async () => {
    // Clear all saved sites before each test
    const all = await savedSiteStore.getAll()
    for (const site of all) {
      if (site.id !== undefined) {
        await savedSiteStore.delete(site.id)
      }
    }
  })

  // -------------------------------------------------------------------------
  // CRUD roundtrip
  // -------------------------------------------------------------------------
  it("add() returns a SavedSite with auto id, savedAt, openCount=0, pinned=false", async () => {
    const site = await savedSiteStore.add({
      url: "https://example.com",
      title: "Example",
      favicon: "https://example.com/favicon.ico",
      thumb: null,
      category: "dev",
    })

    expect(site.id).toBeTypeOf("number")
    expect(site.url).toBe("https://example.com")
    expect(site.title).toBe("Example")
    expect(site.category).toBe("dev")
    expect(site.openCount).toBe(0)
    expect(site.pinned).toBe(false)
    expect(site.savedAt).toBeTypeOf("number")
  })

  it("getAll() returns all added sites", async () => {
    await savedSiteStore.add({
      url: "https://a.com",
      title: "A",
      favicon: null,
      thumb: null,
      category: "news",
    })
    await savedSiteStore.add({
      url: "https://b.com",
      title: "B",
      favicon: null,
      thumb: null,
      category: "news",
    })

    const all = await savedSiteStore.getAll()
    expect(all.length).toBe(2)
  })

  it("getById() returns the correct site", async () => {
    const site = await savedSiteStore.add({
      url: "https://c.com",
      title: "C",
      favicon: null,
      thumb: null,
      category: "social",
    })

    const id = site.id
    expect(id).toBeDefined()
    const found = await savedSiteStore.getById(id as number)
    expect(found).toBeDefined()
    expect(found?.url).toBe("https://c.com")
  })

  it("getById() returns undefined for a missing id", async () => {
    const found = await savedSiteStore.getById(999999)
    expect(found).toBeUndefined()
  })

  it("update() patches a field without affecting others", async () => {
    const site = await savedSiteStore.add({
      url: "https://d.com",
      title: "D",
      favicon: null,
      thumb: null,
      category: "dev",
    })

    const id = site.id as number
    await savedSiteStore.update(id, { title: "D Updated" })
    const updated = await savedSiteStore.getById(id)
    expect(updated?.title).toBe("D Updated")
    expect(updated?.url).toBe("https://d.com")
  })

  it("delete() removes the site", async () => {
    const site = await savedSiteStore.add({
      url: "https://e.com",
      title: "E",
      favicon: null,
      thumb: null,
      category: "entertainment",
    })

    const id = site.id as number
    await savedSiteStore.delete(id)
    const found = await savedSiteStore.getById(id)
    expect(found).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------
  it("search() returns sites matching the title", async () => {
    await savedSiteStore.add({
      url: "https://github.com",
      title: "GitHub",
      favicon: null,
      thumb: null,
      category: "dev",
    })
    await savedSiteStore.add({
      url: "https://twitter.com",
      title: "Twitter",
      favicon: null,
      thumb: null,
      category: "social",
    })

    const results = await savedSiteStore.search("github")
    expect(results.length).toBe(1)
    const first = results[0]
    expect(first).toBeDefined()
    expect(first?.title).toBe("GitHub")
  })

  it("search() returns sites matching the url", async () => {
    await savedSiteStore.add({
      url: "https://news.ycombinator.com",
      title: "Hacker News",
      favicon: null,
      thumb: null,
      category: "news",
    })

    const results = await savedSiteStore.search("ycombinator")
    expect(results.length).toBe(1)
    expect(results[0]?.url).toContain("ycombinator")
  })

  it("search() returns sites matching the category", async () => {
    await savedSiteStore.add({
      url: "https://reddit.com",
      title: "Reddit",
      favicon: null,
      thumb: null,
      category: "social",
    })
    await savedSiteStore.add({
      url: "https://stackoverflow.com",
      title: "Stack Overflow",
      favicon: null,
      thumb: null,
      category: "dev",
    })

    const results = await savedSiteStore.search("dev")
    expect(results.length).toBe(1)
    expect(results[0]?.title).toBe("Stack Overflow")
  })

  it("search() excludes non-matching sites", async () => {
    await savedSiteStore.add({
      url: "https://nonmatching.com",
      title: "NonMatching",
      favicon: null,
      thumb: null,
      category: "other",
    })

    const results = await savedSiteStore.search("xyz_no_match_xyz")
    expect(results.length).toBe(0)
  })

  // -------------------------------------------------------------------------
  // incrementOpenCount — monotonic
  // -------------------------------------------------------------------------
  it("incrementOpenCount() is monotonic — calling twice yields count=2", async () => {
    const site = await savedSiteStore.add({
      url: "https://opened.com",
      title: "Opened",
      favicon: null,
      thumb: null,
      category: "dev",
    })

    const id = site.id as number
    await savedSiteStore.incrementOpenCount(id)
    await savedSiteStore.incrementOpenCount(id)
    const updated = await savedSiteStore.getById(id)
    expect(updated?.openCount).toBe(2)
  })

  // -------------------------------------------------------------------------
  // setPinned — toggle
  // -------------------------------------------------------------------------
  it("setPinned(id, true) then setPinned(id, false) toggles correctly", async () => {
    const site = await savedSiteStore.add({
      url: "https://pinned.com",
      title: "Pinned",
      favicon: null,
      thumb: null,
      category: "dev",
    })

    const id = site.id as number
    await savedSiteStore.setPinned(id, true)
    const pinned = await savedSiteStore.getById(id)
    expect(pinned?.pinned).toBe(true)

    await savedSiteStore.setPinned(id, false)
    const unpinned = await savedSiteStore.getById(id)
    expect(unpinned?.pinned).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Blob round-trip for thumb
  // -------------------------------------------------------------------------
  it("thumb Blob round-trips through add → getById intact", async () => {
    const blobContent = "fake-image-bytes"
    const blob = new Blob([blobContent], { type: "image/webp" })

    const site = await savedSiteStore.add({
      url: "https://thumbed.com",
      title: "Thumbed",
      favicon: null,
      thumb: blob,
      category: "dev",
    })

    const id = site.id as number
    const retrieved = await savedSiteStore.getById(id)
    expect(retrieved?.thumb).toBeInstanceOf(Blob)

    const retrievedBlob = retrieved?.thumb as Blob
    const text = await retrievedBlob.text()
    expect(text).toBe(blobContent)
  })
})
