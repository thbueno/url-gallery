import { UNCATEGORIZED } from "@/lib/categorizer"

/** Adds a tag. The automatic "Uncategorized" tag is dropped once a real tag exists. */
export function withTag(tags: string[], tag: string): string[] {
  if (tags.includes(tag)) return [...tags]
  return [...tags.filter((t) => t !== UNCATEGORIZED), tag]
}

/** Removes a tag. A site left with no tags falls back to "Uncategorized". */
export function withoutTag(tags: string[], tag: string): string[] {
  const next = tags.filter((t) => t !== tag)
  return next.length === 0 ? [UNCATEGORIZED] : next
}

export function toggleTag(tags: string[], tag: string): string[] {
  return tags.includes(tag) ? withoutTag(tags, tag) : withTag(tags, tag)
}

/**
 * Cleans a typed tag name: trims, collapses spaces, and reuses the spelling of an existing tag
 * ("dev tools" becomes "Dev Tools"). Returns "" when the name is empty or "Uncategorized",
 * which is automatic and can't be created by hand.
 */
export function normalizeTagName(raw: string, known: string[]): string {
  const name = raw.trim().replace(/\s+/g, " ")
  const lower = name.toLowerCase()
  if (!name || lower === UNCATEGORIZED.toLowerCase()) return ""
  return known.find((t) => t.toLowerCase() === lower) ?? name
}
