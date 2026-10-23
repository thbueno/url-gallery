// @vitest-environment node
import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { buildBackup, restoreBackup } from "@/lib/gallery-io"
import { savedSiteStore } from "@/lib/store"

// In-memory stand-in for chrome.storage.local (get/set only).
let storage: Record<string, unknown>

function stubChromeStorage() {
  storage = {}
  vi.stubGlobal("chrome", {
    storage: {
      local: {
        get: async (keys: string[]) =>
          Object.fromEntries(keys.filter((k) => k in storage).map((k) => [k, storage[k]])),
        set: async (patch: Record<string, unknown>) => {
          Object.assign(storage, patch)
        },
      },
    },
  })
}

async function wipeDatabase() {
  for (const site of await savedSiteStore.getAll()) {
    if (site.id !== undefined) await savedSiteStore.delete(site.id)
  }
}

// Bytes covering 0x00-0xFF several times over, larger than any btoa chunk size.
function fakeWebpBytes(): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(100_000)
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 7 + 13) % 256
  bytes.set([0x52, 0x49, 0x46, 0x46, 0xff, 0x00, 0x80, 0x57, 0x45, 0x42, 0x50], 0) // "RIFF…WEBP"
  return bytes
}

describe("backup round trip", () => {
  beforeEach(async () => {
    stubChromeStorage()
    await wipeDatabase()
  })

  it("restores every field except id, with byte-equal thumbnails and the same MIME type", async () => {
    const thumbBytes = fakeWebpBytes()
    await savedSiteStore.bulkRestore([
      {
        url: "https://with-thumb.com/page",
        title: "With Thumb",
        favicon: "https://with-thumb.com/favicon.ico",
        thumb: new Blob([thumbBytes], { type: "image/webp" }),
        tags: ["Dev Tools", "Reading"],
        savedAt: 1_700_000_123_456,
        openCount: 7,
        pinned: true,
      },
      {
        url: "https://no-thumb.org",
        title: "No Thumb",
        favicon: null,
        thumb: null,
        tags: ["News"],
        savedAt: 1_650_000_000_000,
        openCount: 0,
        pinned: false,
      },
    ])

    const text = await buildBackup()
    await wipeDatabase()
    const restored = await restoreBackup(text)

    expect(restored.length).toBe(2)
    const withThumb = await savedSiteStore.getByUrl("https://with-thumb.com/page")
    expect(withThumb).toMatchObject({
      title: "With Thumb",
      favicon: "https://with-thumb.com/favicon.ico",
      tags: ["Dev Tools", "Reading"],
      savedAt: 1_700_000_123_456,
      openCount: 7,
      pinned: true,
    })
    const restoredThumb = withThumb?.thumb as Blob
    expect(restoredThumb.type).toBe("image/webp")
    expect(new Uint8Array(await restoredThumb.arrayBuffer())).toEqual(thumbBytes)

    const noThumb = await savedSiteStore.getByUrl("https://no-thumb.org")
    expect(noThumb).toMatchObject({
      title: "No Thumb",
      favicon: null,
      thumb: null,
      tags: ["News"],
      savedAt: 1_650_000_000_000,
      openCount: 0,
      pinned: false,
    })
  })

  it("round-trips tag settings through a fresh chrome.storage.local", async () => {
    storage = {
      pinnedTags: ["Dev Tools", "Reading"],
      customTags: ["Reading", "Recipes"],
      tagOrder: ["Recipes", "Dev Tools", "Reading"],
    }

    const text = await buildBackup()
    storage = {}
    await restoreBackup(text)

    expect(storage).toEqual({
      pinnedTags: ["Dev Tools", "Reading"],
      customTags: ["Reading", "Recipes"],
      tagOrder: ["Recipes", "Dev Tools", "Reading"],
    })
  })

  it("merges incoming tag settings into existing ones instead of replacing them", async () => {
    storage = {
      pinnedTags: ["Dev Tools", "Reading"],
      customTags: ["Reading", "Recipes"],
      tagOrder: ["Recipes", "Dev Tools", "Reading"],
    }
    const text = await buildBackup()

    storage = {
      pinnedTags: ["Music", "Reading"],
      customTags: ["Music", "Travel"],
      tagOrder: ["Travel", "Reading", "Music"],
    }
    await restoreBackup(text)

    expect(storage).toEqual({
      pinnedTags: ["Music", "Reading", "Dev Tools"],
      customTags: ["Music", "Travel", "Reading", "Recipes"],
      tagOrder: ["Travel", "Reading", "Music", "Recipes", "Dev Tools"],
    })
  })
})
