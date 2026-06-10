const OUTPUT_WIDTH = 800
const OUTPUT_HEIGHT = 600
const WEBP_QUALITY = 0.82

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

  const scaleX = OUTPUT_WIDTH / bitmap.width
  const scaleY = OUTPUT_HEIGHT / bitmap.height
  const scale = Math.min(scaleX, scaleY)
  const drawW = bitmap.width * scale
  const drawH = bitmap.height * scale
  const offsetX = (OUTPUT_WIDTH - drawW) / 2
  const offsetY = (OUTPUT_HEIGHT - drawH) / 2
  ctx.drawImage(bitmap, offsetX, offsetY, drawW, drawH)
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
