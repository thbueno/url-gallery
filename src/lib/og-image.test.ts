import { describe, expect, it } from "vitest"

import { extractOgImage } from "@/lib/og-image"

describe("extractOgImage", () => {
  it("returns the og:image content from raw page HTML", () => {
    const html = `<html><head>
      <title>GitHub</title>
      <meta property="og:image" content="https://images.example.com/card.png">
    </head><body></body></html>`
    expect(extractOgImage(html, "https://github.com/")).toBe("https://images.example.com/card.png")
  })

  it("reads content written before property (Webflow style) and ignores og:image:width", () => {
    const html = `<meta property="og:image:width" content="1200"/>
      <meta content="https://cdn.example.com/homepage-og.jpg" property="og:image"/>`
    expect(extractOgImage(html, "https://www.freefaces.gallery/")).toBe(
      "https://cdn.example.com/homepage-og.jpg"
    )
  })

  it("decodes HTML entities so query strings survive (&amp; → &)", () => {
    const html = `<meta property="og:image" content="https://ui.shadcn.com/og?title=Charts&amp;description=Bar"/>`
    expect(extractOgImage(html, "https://ui.shadcn.com/charts/bar")).toBe(
      "https://ui.shadcn.com/og?title=Charts&description=Bar"
    )
  })

  it("falls back to twitter:image when the page has no og:image", () => {
    const html = `<meta name="twitter:image" content="https://ui.spectrumhq.in/og.png"/>`
    expect(extractOgImage(html, "https://ui.spectrumhq.in/blocks")).toBe(
      "https://ui.spectrumhq.in/og.png"
    )
  })

  it("resolves a relative og:image against the page URL", () => {
    const html = `<meta property="og:image" content="/images/og.png"/>`
    expect(extractOgImage(html, "https://example.com/blog/post")).toBe(
      "https://example.com/images/og.png"
    )
  })

  it("returns null when the page declares no preview image", () => {
    expect(
      extractOgImage("<html><head><title>HN</title></head></html>", "https://news.ycombinator.com/")
    ).toBeNull()
  })
})
