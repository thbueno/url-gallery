// Pure text reader: pulls the og:image URL out of a page's raw HTML. Used by the
// service worker, which has no DOMParser, so this works on the HTML string.
function metaAttributes(tag: string): Map<string, string> {
  const attrs = new Map<string, string>()
  for (const [, name, value] of tag.matchAll(/([a-z:-]+)\s*=\s*["']([^"']*)["']/gi)) {
    if (name !== undefined && value !== undefined) {
      attrs.set(name.toLowerCase(), value.replaceAll("&amp;", "&"))
    }
  }
  return attrs
}

function toAbsolute(url: string, pageUrl: string): string | null {
  try {
    return new URL(url, pageUrl).href
  } catch {
    return null
  }
}

export function extractOgImage(html: string, pageUrl: string): string | null {
  let twitterImage: string | null = null
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = metaAttributes(tag)
    const key = attrs.get("property") ?? attrs.get("name")
    const content = attrs.get("content")
    if (!content) {
      continue
    }
    if (key === "og:image") {
      return toAbsolute(content, pageUrl)
    }
    if (key === "twitter:image" && twitterImage === null) {
      twitterImage = content
    }
  }
  return twitterImage === null ? null : toAbsolute(twitterImage, pageUrl)
}
