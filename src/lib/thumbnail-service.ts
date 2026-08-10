const OUTPUT_WIDTH = 800
const OUTPUT_HEIGHT = 450
const WEBP_QUALITY = 0.82

// Domains known to serve a generic, non-representative og:image to
// unauthenticated server-side fetches (same branded card for every URL).
// For these, the caller should prefer a client-side tab screenshot instead
// of the fetched og:image.
export const GENERIC_OG_DOMAINS = ["x.com", "twitter.com"]

async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)

  const canvas = new OffscreenCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT)
  const ctx = canvas.getContext("2d")
  if (ctx === null) {
    bitmap.close()
    throw new Error("Failed to get 2d context from OffscreenCanvas")
  }

  // True cover-fit, top-aligned, mathematically gap-proof. Math.max(scaleX,
  // scaleY) guarantees drawW >= OUTPUT_WIDTH and drawH >= OUTPUT_HEIGHT
  // simultaneously for ANY source aspect ratio, so there is never a blank
  // strip. offsetX centers the (small) horizontal excess; offsetY is pinned
  // to 0 so vertical excess is cropped from the bottom only, keeping the top
  // of the source visible. Do NOT "simplify" this to contain-fit or to
  // fit-width-only — both reintroduce a residual gap for sources wider than
  // 16:9 (the common case: most OG images are ~1.9:1).
  const scaleX = OUTPUT_WIDTH / bitmap.width
  const scaleY = OUTPUT_HEIGHT / bitmap.height
  const scale = Math.max(scaleX, scaleY)
  const drawW = bitmap.width * scale
  const drawH = bitmap.height * scale
  const offsetX = (OUTPUT_WIDTH - drawW) / 2
  const offsetY = 0
  ctx.drawImage(bitmap, offsetX, offsetY, drawW, drawH)
  bitmap.close()

  return canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY })
}

export async function fetchAndResize(
  imageUrl: string,
  faviconUrl: string,
  fallbackImageUrls: string[] = []
): Promise<Blob> {
  for (const url of [imageUrl, ...fallbackImageUrls]) {
    try {
      return await urlToBlob(url)
    } catch {
      // try next candidate
    }
  }
  return urlToBlob(faviconUrl)
}
