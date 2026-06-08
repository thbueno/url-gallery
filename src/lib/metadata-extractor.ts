export function extractMetadata(document: Document): {
  imageUrl: string | undefined
  faviconUrl: string | undefined
  title: string | undefined
  type: string | undefined
} {
  // Extract imageUrl: og:image → apple-touch-icon → /favicon.ico
  const imageUrl =
    getMetaContent(document, "og:image") ||
    getLinkHref(document, "apple-touch-icon") ||
    "/favicon.ico"

  // Extract faviconUrl: icon → shortcut icon → /favicon.ico
  const faviconUrl =
    getLinkHref(document, "icon") || getLinkHref(document, "shortcut icon") || "/favicon.ico"

  // Extract title: og:title → <title> element text → undefined
  const ogTitle = getMetaContent(document, "og:title")
  const pageTitle = document.title || undefined
  const title = ogTitle || pageTitle || undefined

  // Extract type: og:type → undefined
  const type = getMetaContent(document, "og:type") || undefined

  return {
    imageUrl,
    faviconUrl,
    title,
    type,
  }
}

/**
 * Get content attribute of a meta tag by property name
 */
function getMetaContent(document: Document, propertyName: string): string | undefined {
  const metaTag = document.querySelector(`meta[property="${propertyName}"]`)
  const content = metaTag?.getAttribute("content")
  // Treat empty string as falsy
  return content?.trim() ? content : undefined
}

/**
 * Get href attribute of a link tag by rel value
 */
function getLinkHref(document: Document, relValue: string): string | undefined {
  const linkTag = document.querySelector(`link[rel="${relValue}"]`)
  const href = linkTag?.getAttribute("href")
  // Treat empty string as falsy
  return href?.trim() ? href : undefined
}
