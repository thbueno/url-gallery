import { fetchAndResize } from "@/lib/thumbnail-service"
import { beforeEach, describe, expect, it, vi } from "vitest"

// ---------------------------------------------------------------------------
// Global mock scaffolding for browser APIs absent in Node/jsdom
// ---------------------------------------------------------------------------

const mockWebPBlob = new Blob([], { type: "image/webp" })

const mockBitmap = { width: 800, height: 450, close: vi.fn() }

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

  it("calls convertToBlob with { type: 'image/webp', quality: 0.82 }", async () => {
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    expect(mockCanvas.convertToBlob).toHaveBeenCalledWith({
      type: "image/webp",
      quality: 0.82,
    })
  })

  it("draws image at 800×450 with cover-fit, top-aligned crop (exact-fit image has no offset)", async () => {
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    // mockBitmap is 800×450 — scale=1, offsets=(0,0)
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockBitmap, 0, 0, 800, 450)
    expect(global.OffscreenCanvas).toHaveBeenCalledWith(800, 450)
  })

  it("cover-fit crops a wide image (1200×630) from the sides, with zero vertical gap", async () => {
    const wideBitmap = { width: 1200, height: 630, close: vi.fn() }
    ;(global.createImageBitmap as ReturnType<typeof vi.fn>).mockResolvedValue(wideBitmap)
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    // scale = max(800/1200, 450/630) = max(0.6667, 0.7143) = 0.7143 (scaleY wins)
    const scale = Math.max(800 / 1200, 450 / 630)
    const drawW = 1200 * scale
    const drawH = 630 * scale
    const offsetX = (800 - drawW) / 2

    expect(drawH).toBe(450) // fills canvas height exactly — zero vertical gap
    expect(drawW).toBeGreaterThan(800) // overflows canvas width — side-cropped, not gapped
    expect(offsetX).toBeLessThan(0) // centered horizontal crop
    expect(mockCtx.drawImage).toHaveBeenCalledWith(wideBitmap, offsetX, 0, drawW, drawH)
    expect(global.OffscreenCanvas).toHaveBeenCalledWith(800, 450)
  })

  it("cover-fit produces zero gap for a very wide image (1900×1000), cropping sides instead", async () => {
    // 1900×1000 (~1.9:1) is wider than the 16:9 canvas. The old fit-width
    // logic left a ~30px blank gap at the bottom here — cover-fit must not.
    const veryWideBitmap = { width: 1900, height: 1000, close: vi.fn() }
    ;(global.createImageBitmap as ReturnType<typeof vi.fn>).mockResolvedValue(veryWideBitmap)
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    const scale = Math.max(800 / 1900, 450 / 1000)
    const drawW = 1900 * scale
    const drawH = 1000 * scale
    const offsetX = (800 - drawW) / 2

    expect(drawH).toBe(450) // exact height, no gap
    expect(drawW).toBeGreaterThanOrEqual(800) // covers full width too — no gap possible
    expect(mockCtx.drawImage).toHaveBeenCalledWith(veryWideBitmap, offsetX, 0, drawW, drawH)
  })

  it("cover-fit clips a tall/narrow image (600×900) from the bottom, no side-crop", async () => {
    // 600×900 is narrower than 16:9, so scaling by width alone already
    // overflows canvas height — cover-fit picks scaleX here too, so this
    // matches fit-width behavior: no side-crop, clipped from bottom only.
    const tallBitmap = { width: 600, height: 900, close: vi.fn() }
    ;(global.createImageBitmap as ReturnType<typeof vi.fn>).mockResolvedValue(tallBitmap)
    vi.stubGlobal("fetch", makeFetchMock())

    await fetchAndResize(imageUrl, faviconUrl)

    const scale = Math.max(800 / 600, 450 / 900)
    const drawW = 600 * scale
    const drawH = 900 * scale

    expect(drawW).toBe(800) // no side-crop for this aspect ratio
    expect(drawH).toBeGreaterThan(450) // overflows canvas, clipped at bottom
    expect(mockCtx.drawImage).toHaveBeenCalledWith(tallBitmap, 0, 0, drawW, drawH)
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
