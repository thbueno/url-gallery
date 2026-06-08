import { describe, expect, it } from "vitest"
import { extractMetadata } from "./metadata-extractor"

describe("extractMetadata", () => {
  // Helper to parse HTML string into Document
  const parseHtml = (html: string): Document => {
    const parser = new DOMParser()
    return parser.parseFromString(html, "text/html")
  }

  describe("imageUrl", () => {
    it("returns og:image content when present", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:image" content="https://example.com/og-image.png" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("https://example.com/og-image.png")
    })

    it("falls back to apple-touch-icon when og:image absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="apple-touch-icon" href="https://example.com/apple-touch-icon.png" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("https://example.com/apple-touch-icon.png")
    })

    it("falls back to /favicon.ico when both og:image and apple-touch-icon absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("/favicon.ico")
    })

    it("prefers og:image over apple-touch-icon", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:image" content="https://example.com/og-image.png" />
            <link rel="apple-touch-icon" href="https://example.com/apple-touch-icon.png" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("https://example.com/og-image.png")
    })
  })

  describe("faviconUrl", () => {
    it("returns icon link href when present", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="icon" href="https://example.com/icon.png" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.faviconUrl).toBe("https://example.com/icon.png")
    })

    it("falls back to shortcut icon when icon absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="shortcut icon" href="https://example.com/favicon.ico" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.faviconUrl).toBe("https://example.com/favicon.ico")
    })

    it("falls back to /favicon.ico when both icon and shortcut icon absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.faviconUrl).toBe("/favicon.ico")
    })

    it("prefers icon over shortcut icon", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="icon" href="https://example.com/icon.png" />
            <link rel="shortcut icon" href="https://example.com/favicon.ico" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.faviconUrl).toBe("https://example.com/icon.png")
    })
  })

  describe("title", () => {
    it("returns og:title content when present", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Open Graph Title" />
            <title>Page Title</title>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.title).toBe("Open Graph Title")
    })

    it("falls back to <title> element text when og:title absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Page Title</title>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.title).toBe("Page Title")
    })

    it("returns undefined when both og:title and <title> absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.title).toBeUndefined()
    })

    it("prefers og:title over <title>", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="OG Title" />
            <title>Regular Title</title>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.title).toBe("OG Title")
    })
  })

  describe("type", () => {
    it("returns og:type content when present", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:type" content="website" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.type).toBe("website")
    })

    it("returns undefined when og:type absent", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.type).toBeUndefined()
    })

    it("returns og:type for article type", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:type" content="article" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.type).toBe("article")
    })
  })

  describe("all fields missing", () => {
    it("returns undefined for all fields when no metadata present", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("/favicon.ico")
      expect(result.faviconUrl).toBe("/favicon.ico")
      expect(result.title).toBeUndefined()
      expect(result.type).toBeUndefined()
    })
  })

  describe("empty attributes", () => {
    it("treats empty og:image as falsy", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:image" content="" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("/favicon.ico")
    })

    it("treats empty og:title as falsy", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="" />
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.title).toBeUndefined()
    })

    it("treats empty title element as falsy", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title></title>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.title).toBeUndefined()
    })
  })

  describe("integration: complete page with all metadata", () => {
    it("extracts all fields from a complete page", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:image" content="https://example.com/og-image.png" />
            <meta property="og:title" content="Example Site" />
            <meta property="og:type" content="website" />
            <link rel="icon" href="https://example.com/icon.png" />
            <title>Example Page</title>
          </head>
          <body></body>
        </html>
      `
      const doc = parseHtml(html)
      const result = extractMetadata(doc)
      expect(result.imageUrl).toBe("https://example.com/og-image.png")
      expect(result.faviconUrl).toBe("https://example.com/icon.png")
      expect(result.title).toBe("Example Site")
      expect(result.type).toBe("website")
    })
  })
})
