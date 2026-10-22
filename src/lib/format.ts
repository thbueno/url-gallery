/** Hostname without a leading "www.", or "" for an invalid url. */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

const DAY = 86_400_000

/** "Mar 4", or "Mar 4, 2024" when the date is not in the current year. */
function formatDate(ts: number, now: number): string {
  const d = new Date(ts)
  const sameYear = d.getFullYear() === new Date(now).getFullYear()
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

/** "Today", "Yesterday", "5d ago", "3w ago", then a short date once older than about two months. */
export function timeAgo(ts: number, now = Date.now()): string {
  const days = Math.floor((now - ts) / DAY)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 60) return `${Math.floor(days / 7)}w ago`
  return formatDate(ts, now)
}
