export const ALL_TAGS: string[] = [
  "Video",
  "Music",
  "News",
  "Social",
  "Shopping",
  "Dev Tools",
  "Docs",
  "Design",
  "Uncategorized",
]

function categorizeSingle(
  type: string | undefined,
  _siteName: string | undefined,
  domain: string
): string {
  if (type !== undefined) {
    if (type.startsWith("video.")) return "Video"
    if (type.startsWith("music.")) return "Music"
  }

  const d = domain.toLowerCase()

  if (
    d.includes("youtube") ||
    d.includes("vimeo") ||
    d.includes("twitch") ||
    d.includes("dailymotion")
  )
    return "Video"

  if (
    d.includes("twitter") ||
    d.includes("x.com") ||
    d.includes("instagram") ||
    d.includes("facebook") ||
    d.includes("linkedin") ||
    d.includes("reddit") ||
    d.includes("tiktok") ||
    d.includes("threads")
  )
    return "Social"

  if (
    d.includes("github") ||
    d.includes("gitlab") ||
    d.includes("stackoverflow") ||
    d.includes("npm") ||
    d.includes("crates.io") ||
    d.includes("pypi") ||
    d.includes("docker")
  )
    return "Dev Tools"

  if (
    d.includes("docs.") ||
    d.includes("developer.") ||
    d.includes("devdocs") ||
    d.includes("mdn") ||
    d.includes("readthedocs")
  )
    return "Docs"

  if (
    d.includes("figma") ||
    d.includes("dribbble") ||
    d.includes("behance") ||
    d.includes("canva") ||
    d.includes("sketch")
  )
    return "Design"

  if (
    d.includes("amazon") ||
    d.includes("ebay") ||
    d.includes("shopify") ||
    d.includes("etsy") ||
    d.includes("aliexpress")
  )
    return "Shopping"

  if (
    d.includes("bbc") ||
    d.includes("cnn") ||
    d.includes("reuters") ||
    d.includes("nytimes") ||
    d.includes("theguardian") ||
    d.includes("techcrunch") ||
    d.includes("hackernews") ||
    d.includes("hn.")
  )
    return "News"

  return "Uncategorized"
}

export function categorize(
  type: string | undefined,
  siteName: string | undefined,
  domain: string
): string[] {
  return [categorizeSingle(type, siteName, domain)]
}
