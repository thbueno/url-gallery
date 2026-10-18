/** Small pure helpers variants may share (formatting only; no layout). */

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

const DAY = 86_400_000

/** "Today", "Yesterday", "5d ago", "3w ago", "Mar 4" (older than ~2 months). */
export function timeAgo(ts: number, now = Date.now()): string {
  const days = Math.floor((now - ts) / DAY)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 60) return `${Math.floor(days / 7)}w ago`
  return formatDate(ts)
}

/** "Mar 4" or "Mar 4, 2024" when not in the current year. */
export function formatDate(ts: number): string {
  const d = new Date(ts)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

/** Compact number, e.g. 1.2k. */
export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}
