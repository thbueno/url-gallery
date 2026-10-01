// Pure text reader: pulls the og:image URL out of a page's raw HTML. Used by the
// service worker, which has no DOMParser, so this works on the HTML string.
const NAMED_ENTITIES: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" }

function decodeEntities(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (match, dec, hex, named) => {
    if (named !== undefined) {
      return NAMED_ENTITIES[named.toLowerCase()] ?? match
    }
    const code = dec !== undefined ? Number.parseInt(dec, 10) : Number.parseInt(hex, 16)
    try {
      return String.fromCodePoint(code)
    } catch {
      return match
    }
  })
}

// A regex parser rather than DOMParser because the service worker has none.
function metaAttributes(tag: string): Map<string, string> {
  const attrs = new Map<string, string>()
  for (const [, name, dq, sq] of tag.matchAll(/([a-z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const value = dq ?? sq
    if (name !== undefined && value !== undefined) {
      attrs.set(name.toLowerCase(), decodeEntities(value))
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
    const key = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase()
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
