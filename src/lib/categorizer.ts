export type Category =
  | "Video"
  | "Music"
  | "News"
  | "Social"
  | "Shopping"
  | "Dev Tools"
  | "Docs"
  | "Design"
  | "Uncategorized"

export function categorize(
  type: string | undefined,
  _siteName: string | undefined,
  domain: string
): Category {
  // Priority 1: Check OG type for "video." and "music." prefixes
  if (type !== undefined) {
    if (type.startsWith("video.")) {
      return "Video"
    }
    if (type.startsWith("music.")) {
      return "Music"
    }
  }

  // Priority 2: For generic types or undefined, apply domain heuristics
  const domainLower = domain.toLowerCase()

  // Video domains
  if (
    domainLower.includes("youtube") ||
    domainLower.includes("vimeo") ||
    domainLower.includes("twitch") ||
    domainLower.includes("dailymotion")
  ) {
    return "Video"
  }

  // Social domains
  if (
    domainLower.includes("twitter") ||
    domainLower.includes("x.com") ||
    domainLower.includes("instagram") ||
    domainLower.includes("facebook") ||
    domainLower.includes("linkedin") ||
    domainLower.includes("reddit") ||
    domainLower.includes("tiktok") ||
    domainLower.includes("threads")
  ) {
    return "Social"
  }

  // Dev Tools domains
  if (
    domainLower.includes("github") ||
    domainLower.includes("gitlab") ||
    domainLower.includes("stackoverflow") ||
    domainLower.includes("npm") ||
    domainLower.includes("crates.io") ||
    domainLower.includes("pypi") ||
    domainLower.includes("docker")
  ) {
    return "Dev Tools"
  }

  // Docs domains
  if (
    domainLower.includes("docs.") ||
    domainLower.includes("developer.") ||
    domainLower.includes("devdocs") ||
    domainLower.includes("mdn") ||
    domainLower.includes("readthedocs")
  ) {
    return "Docs"
  }

  // Design domains
  if (
    domainLower.includes("figma") ||
    domainLower.includes("dribbble") ||
    domainLower.includes("behance") ||
    domainLower.includes("canva") ||
    domainLower.includes("sketch")
  ) {
    return "Design"
  }

  // Shopping domains
  if (
    domainLower.includes("amazon") ||
    domainLower.includes("ebay") ||
    domainLower.includes("shopify") ||
    domainLower.includes("etsy") ||
    domainLower.includes("aliexpress")
  ) {
    return "Shopping"
  }

  // News domains
  if (
    domainLower.includes("bbc") ||
    domainLower.includes("cnn") ||
    domainLower.includes("reuters") ||
    domainLower.includes("nytimes") ||
    domainLower.includes("theguardian") ||
    domainLower.includes("techcrunch") ||
    domainLower.includes("hackernews") ||
    domainLower.includes("hn.")
  ) {
    return "News"
  }

  // Default fallback
  return "Uncategorized"
}
