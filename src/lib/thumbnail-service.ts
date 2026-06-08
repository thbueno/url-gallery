const OUTPUT_WIDTH = 400
const OUTPUT_HEIGHT = 300
const WEBP_QUALITY = 0.6

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

  ctx.drawImage(bitmap, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)
  bitmap.close()

  return canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY })
}

export async function fetchAndResize(imageUrl: string, faviconUrl: string): Promise<Blob> {
  try {
    return await urlToBlob(imageUrl)
  } catch {
    return await urlToBlob(faviconUrl)
  }
}
