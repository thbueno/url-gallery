import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { focusExistingTab } from "./focus-tab"

const chromeMock = {
  tabs: { query: vi.fn(), update: vi.fn() },
  windows: { update: vi.fn() },
}

beforeEach(() => {
  vi.stubGlobal("chrome", chromeMock)
  chromeMock.tabs.query.mockReset().mockResolvedValue([])
  chromeMock.tabs.update.mockReset().mockResolvedValue(undefined)
  chromeMock.windows.update.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("focusExistingTab", () => {
  it("returns false and focuses nothing when no tab matches", async () => {
    expect(await focusExistingTab("https://a.test/")).toBe(false)
    expect(chromeMock.tabs.query).toHaveBeenCalledWith({ url: "https://a.test/" })
    expect(chromeMock.tabs.update).not.toHaveBeenCalled()
    expect(chromeMock.windows.update).not.toHaveBeenCalled()
  })

  it("activates the matching tab and focuses its window", async () => {
    chromeMock.tabs.query.mockResolvedValue([{ id: 4, windowId: 2 }])
    expect(await focusExistingTab("https://a.test/")).toBe(true)
    expect(chromeMock.tabs.update).toHaveBeenCalledWith(4, { active: true })
    expect(chromeMock.windows.update).toHaveBeenCalledWith(2, { focused: true })
  })
})
