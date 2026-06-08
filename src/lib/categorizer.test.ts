import { describe, expect, it } from "vitest"
import { categorize } from "./categorizer"
import type { Category } from "./categorizer"

describe("categorize", () => {
  const cases: [string | undefined, string | undefined, string, Category][] = [
    // OG type mapping — "video." prefix
    ["video.movie", undefined, "youtube.com", "Video"],
    ["video.other", undefined, "vimeo.com", "Video"],
    // OG type mapping — "music." prefix
    ["music.song", undefined, "spotify.com", "Music"],
    ["music.album", undefined, "soundcloud.com", "Music"],
    // Domain heuristics when type is undefined
    [undefined, undefined, "github.com", "Dev Tools"],
    [undefined, undefined, "stackoverflow.com", "Dev Tools"],
    [undefined, undefined, "twitter.com", "Social"],
    [undefined, undefined, "instagram.com", "Social"],
    [undefined, undefined, "bbc.co.uk", "News"],
    [undefined, undefined, "cnn.com", "News"],
    [undefined, undefined, "figma.com", "Design"],
    [undefined, undefined, "dribbble.com", "Design"],
    [undefined, undefined, "amazon.com", "Shopping"],
    [undefined, undefined, "etsy.com", "Shopping"],
    [undefined, undefined, "docs.python.org", "Docs"],
    [undefined, undefined, "developer.mozilla.org", "Docs"],
    [undefined, undefined, "randomsite.com", "Uncategorized"],
    // Domain heuristics when type is "website" (generic)
    ["website", undefined, "twitter.com", "Social"],
    ["website", undefined, "github.com", "Dev Tools"],
    ["website", undefined, "amazon.com", "Shopping"],
    ["website", undefined, "randomsite.com", "Uncategorized"],
    // Domain heuristics when type is "article" (generic)
    ["article", undefined, "bbc.co.uk", "News"],
    ["article", undefined, "techcrunch.com", "News"],
    ["article", undefined, "randomsite.com", "Uncategorized"],
    // siteName parameter is included but should not affect categorization
    [undefined, "Some Site", "youtube.com", "Video"],
    ["video.movie", "Some Site", "randomsite.com", "Video"],
    // Additional domain matches
    [undefined, undefined, "youtube.com", "Video"],
    [undefined, undefined, "twitch.tv", "Video"],
    [undefined, undefined, "dailymotion.com", "Video"],
    [undefined, undefined, "facebook.com", "Social"],
    [undefined, undefined, "linkedin.com", "Social"],
    [undefined, undefined, "reddit.com", "Social"],
    [undefined, undefined, "tiktok.com", "Social"],
    [undefined, undefined, "gitlab.com", "Dev Tools"],
    [undefined, undefined, "npm.org", "Dev Tools"],
    [undefined, undefined, "docker.com", "Dev Tools"],
    [undefined, undefined, "mdn.org", "Docs"],
    [undefined, undefined, "behance.net", "Design"],
    [undefined, undefined, "canva.com", "Design"],
    [undefined, undefined, "reuters.com", "News"],
    [undefined, undefined, "nytimes.com", "News"],
    [undefined, undefined, "theguardian.com", "News"],
    [undefined, undefined, "hackernews.com", "News"],
    [undefined, undefined, "ebay.com", "Shopping"],
    [undefined, undefined, "aliexpress.com", "Shopping"],
  ]

  it.each(cases)("categorize(%s, %s, %s) → %s", (type, siteName, domain, expected) => {
    expect(categorize(type, siteName, domain)).toBe(expected)
  })
})
