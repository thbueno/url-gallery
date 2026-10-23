import { act, createElement } from "react"
import { type Root, createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { usePopupSave } from "./usePopupSave"

const getByUrl = vi.fn()
vi.mock("@/lib/store", () => ({ savedSiteStore: { getByUrl: (url: string) => getByUrl(url) } }))

type PopupState = ReturnType<typeof usePopupSave>

const TAB = {
  id: 7,
  windowId: 1,
  url: "https://example.com/post",
  title: "(3) A post",
  favIconUrl: "https://example.com/fav.ico",
}

const chromeMock = {
  permissions: { contains: vi.fn(), request: vi.fn() },
  storage: { local: { get: vi.fn(), set: vi.fn() } },
  tabs: { query: vi.fn(), create: vi.fn(), captureVisibleTab: vi.fn() },
  scripting: { executeScript: vi.fn() },
  runtime: { sendMessage: vi.fn(), getURL: (p: string) => `chrome-extension://x/${p}` },
}

let root: Root
let current: PopupState

function Probe() {
  current = usePopupSave()
  return null
}

async function mount() {
  await act(async () => {
    root.render(createElement(Probe))
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.stubGlobal("chrome", chromeMock)
  getByUrl.mockReset().mockResolvedValue(undefined)
  chromeMock.permissions.contains.mockReset().mockResolvedValue(false)
  chromeMock.permissions.request.mockReset()
  chromeMock.storage.local.get.mockReset().mockResolvedValue({})
  chromeMock.storage.local.set.mockReset().mockResolvedValue(undefined)
  chromeMock.tabs.query.mockReset().mockResolvedValue([TAB])
  chromeMock.scripting.executeScript.mockReset().mockResolvedValue([{ result: undefined }])
  chromeMock.runtime.sendMessage.mockReset().mockResolvedValue({ ok: true })
  root = createRoot(document.createElement("div"))
})

afterEach(() => {
  act(() => root.unmount())
  vi.unstubAllGlobals()
})

describe("usePopupSave", () => {
  it("starts idle with the permission prompt when nothing is granted or declined", async () => {
    await mount()
    expect(current.saveState).toBe("idle")
    expect(current.showPermPrompt).toBe(true)
    expect(current.isSaved).toBe(false)
  })

  it("starts saved (without the post-save hint) when the page is already saved", async () => {
    getByUrl.mockResolvedValue({ id: "1" })
    await mount()
    expect(current.saveState).toBe("saved-favicon")
    expect(current.alreadySavedOnOpen).toBe(true)
    expect(current.isSaved).toBe(true)
  })

  it("reflects granted and declined permission state", async () => {
    chromeMock.permissions.contains.mockResolvedValue(true)
    chromeMock.storage.local.get.mockResolvedValue({ permissionDeclined: true })
    await mount()
    expect(current.permGranted).toBe(true)
    expect(current.permDeclined).toBe(true)
    expect(current.showPermPrompt).toBe(false)
  })

  it("saves the tab, stripping the unread badge, and ends in saved-favicon without permission", async () => {
    await mount()
    await act(async () => {
      await current.handleSaveTab()
    })
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SAVE_REQUEST",
        url: TAB.url,
        title: "A post",
        faviconUrl: TAB.favIconUrl,
      })
    )
    expect(current.saveState).toBe("saved-favicon")
    expect(current.alreadySavedOnOpen).toBe(false)
  })

  it("ends in saved-full when host permission is granted", async () => {
    chromeMock.permissions.contains.mockResolvedValue(true)
    await mount()
    await act(async () => {
      await current.handleSaveTab()
    })
    expect(current.saveState).toBe("saved-full")
  })

  it("shows an error when the service worker reports a failure", async () => {
    chromeMock.runtime.sendMessage.mockResolvedValue({ ok: false, error: "nope" })
    await mount()
    await act(async () => {
      await current.handleSaveTab()
    })
    expect(current.saveState).toBe("error")
    expect(current.saveError).toBe("nope")
  })

  it("refuses to save a non-http page", async () => {
    chromeMock.tabs.query.mockResolvedValue([{ ...TAB, url: "chrome://extensions" }])
    await mount()
    await act(async () => {
      await current.handleSaveTab()
    })
    expect(current.saveState).toBe("error")
    expect(current.saveError).toBe("Can't save this page")
    expect(chromeMock.runtime.sendMessage).not.toHaveBeenCalled()
  })

  it("remembers a declined permission request", async () => {
    chromeMock.permissions.request.mockResolvedValue(false)
    await mount()
    await act(async () => {
      await current.handleGrantPermission()
    })
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ permissionDeclined: true })
    expect(current.permDeclined).toBe(true)
    expect(current.showPermPrompt).toBe(false)
  })

  it("marks permission granted when the request is accepted", async () => {
    chromeMock.permissions.request.mockResolvedValue(true)
    await mount()
    await act(async () => {
      await current.handleGrantPermission()
    })
    expect(current.permGranted).toBe(true)
    expect(chromeMock.storage.local.set).not.toHaveBeenCalled()
  })
})
