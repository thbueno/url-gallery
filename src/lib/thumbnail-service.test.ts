import { fetchAndResize } from "@/lib/thumbnail-service"
import { beforeEach, describe, expect, it, vi } from "vitest"

// ---------------------------------------------------------------------------
// Global mock scaffolding for browser APIs absent in Node/jsdom
// ---------------------------------------------------------------------------

const mockWebPBlob = new Blob([], { type: "image/webp" })

const mockBitmap = { width: 400, height: 300, close: vi.fn() }

const mockCtx = {
  drawImage: vi.fn(),
}

const mockCanvas = {
  getContext: vi.fn().mockReturnValue(mockCtx),
  convertToBlob: vi.fn().mockResolvedValue(mockWebPBlob),
}

// Cast required: OffscreenCanvas is a browser global not present in Node
// (noImplicitAny + strict: must annotate the cast intentionally)
global.OffscreenCanvas = vi
  .fn()
  .mockImplementation(() => mockCanvas) as unknown as typeof OffscreenCanvas

// Cast required: createImageBitmap is a browser global not present in Node
global.createImageBitmap = vi
  .fn()
  .mockResolvedValue(mockBitmap) as unknown as typeof createImageBitmap

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchMock(blob: Blob = new Blob(["img"], { type: "image/png" })) {
  return vi.fn().mockResolvedValue({ blob: vi.fn().mockResolvedValue(blob) })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("fetchAndResize", () => {
  const imageUrl = "https://example.com/image.png"
  const faviconUrl = "https://example.com/favicon.ico"

  beforeEach(() => {
    vi.clearAllMocks()

    // Re-establish happy-path defaults after each clear
    mockCtx.drawImage.mockReset()
    mockCanvas.getContext.mockReturnValue(mockCtx)
    mockCanvas.convertToBlob.mockResolvedValue(mockWebPBlob)
    ;(global.createImageBitmap as ReturnType<typeof vi.fn>).mockResolvedValue(mockBitmap)
    ;(global.OffscreenCanvas as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => mockCanvas
    )
  })

  it("happy path: returns a Blob with type image/webp", async () => {
    vi.stubGlobal("fetch", makeFetchMock())

    const result = await fetchAndResize(imageUrl, faviconUrl)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe("image/webp")
  })

  it("calls convertToBlob with { type: 'image/webp', quality: 0.6 }", async () => {
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    expect(mockCanvas.convertToBlob).toHaveBeenCalledWith({
      type: "image/webp",
      quality: 0.6,
    })
  })

  it("draws image at 400×300", async () => {
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockBitmap, 0, 0, 400, 300)
  })

  it("falls back to faviconUrl when first fetch rejects", async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValue({ blob: vi.fn().mockResolvedValue(new Blob([], { type: "image/png" })) })

    vi.stubGlobal("fetch", mockFetch)

    const result = await fetchAndResize(imageUrl, faviconUrl)

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(2, faviconUrl)
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe("image/webp")
  })

  it("falls back to faviconUrl when first createImageBitmap rejects", async () => {
    vi.stubGlobal("fetch", makeFetchMock())
    ;(global.createImageBitmap as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("decode error"))
      .mockResolvedValue(mockBitmap)

    const result = await fetchAndResize(imageUrl, faviconUrl)

    expect(global.createImageBitmap).toHaveBeenCalledTimes(2)
    expect(result.type).toBe("image/webp")
  })

  it("throws when both imageUrl and faviconUrl fail", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("all down"))

    vi.stubGlobal("fetch", mockFetch)

    await expect(fetchAndResize(imageUrl, faviconUrl)).rejects.toThrow()
  })
})
