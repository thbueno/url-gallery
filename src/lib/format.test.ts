import { describe, expect, it } from "vitest"

import { getDomain, timeAgo } from "@/lib/format"

const NOW = new Date("2026-06-15T12:00:00Z").getTime()
const DAY = 86_400_000

describe("timeAgo", () => {
  it("says Today for less than a day", () => {
    expect(timeAgo(NOW - 3_600_000, NOW)).toBe("Today")
  })

  it("says Today for a timestamp slightly in the future", () => {
    expect(timeAgo(NOW + 60_000, NOW)).toBe("Today")
  })

  it("says Yesterday for one day", () => {
    expect(timeAgo(NOW - DAY, NOW)).toBe("Yesterday")
  })

  it("counts days up to six", () => {
    expect(timeAgo(NOW - 5 * DAY, NOW)).toBe("5d ago")
  })

  it("counts weeks from seven days", () => {
    expect(timeAgo(NOW - 7 * DAY, NOW)).toBe("1w ago")
    expect(timeAgo(NOW - 30 * DAY, NOW)).toBe("4w ago")
  })

  it("falls back to a short date after about two months", () => {
    expect(timeAgo(new Date("2026-03-04T12:00:00Z").getTime(), NOW)).toBe("Mar 4")
  })

  it("adds the year for dates in another year", () => {
    expect(timeAgo(new Date("2024-03-04T12:00:00Z").getTime(), NOW)).toBe("Mar 4, 2024")
  })
})

describe("getDomain", () => {
  it("returns the hostname without www", () => {
    expect(getDomain("https://www.example.com/a?b=1")).toBe("example.com")
  })

  it("returns an empty string for an invalid url", () => {
    expect(getDomain("not a url")).toBe("")
  })
})
