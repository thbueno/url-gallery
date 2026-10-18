import type { SavedSite } from "@/lib/store"

const DAY = 86_400_000
const now = Date.now()

const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

type Seed = [
  title: string,
  url: string,
  tags: string[],
  daysAgo: number,
  openCount: number,
  pinned?: boolean,
  noFavicon?: boolean,
]

const SEEDS: Seed[] = [
  ["GitHub", "https://github.com/", ["Dev Tools"], 92, 148, true],
  ["Figma", "https://www.figma.com/", ["Design"], 80, 96, true],
  ["Linear", "https://linear.app/", ["Dev Tools"], 61, 71, true],
  ["Notion", "https://www.notion.so/", ["Docs"], 75, 64, true],
  ["MDN Web Docs", "https://developer.mozilla.org/", ["Docs", "Dev Tools"], 70, 88],
  ["Tailwind CSS Documentation", "https://tailwindcss.com/docs", ["Docs", "Design"], 44, 52],
  ["YouTube", "https://www.youtube.com/", ["Video"], 120, 133],
  ["Spotify", "https://open.spotify.com/", ["Music"], 110, 57],
  ["Bandcamp", "https://bandcamp.com/", ["Music"], 33, 12],
  ["Hacker News", "https://news.ycombinator.com/", ["News", "Dev Tools"], 99, 109],
  ["The Verge", "https://www.theverge.com/", ["News"], 21, 9],
  ["Are.na", "https://www.are.na/", ["Design", "Social"], 18, 14],
  ["Dribbble", "https://dribbble.com/", ["Design", "Social"], 40, 23],
  ["Mastodon", "https://mastodon.social/", ["Social"], 52, 6],
  ["Reddit", "https://www.reddit.com/", ["Social", "News"], 85, 41],
  ["Amazon", "https://www.amazon.com/", ["Shopping"], 14, 17],
  ["Etsy", "https://www.etsy.com/", ["Shopping"], 9, 3],
  ["Vercel", "https://vercel.com/dashboard", ["Dev Tools"], 27, 38],
  ["Stack Overflow", "https://stackoverflow.com/", ["Dev Tools", "Docs"], 66, 79],
  ["Vimeo Staff Picks", "https://vimeo.com/channels/staffpicks", ["Video", "Design"], 6, 4],
  ["A List Apart", "https://alistapart.com/", ["Design", "Docs"], 4, 2],
  ["Smashing Magazine", "https://www.smashingmagazine.com/", ["Design", "Docs"], 2, 1, false, true],
  [
    "Personal Reading List",
    "https://example.com/reading-list",
    ["Uncategorized"],
    1,
    0,
    false,
    true,
  ],
  ["Weather Today", "https://weather.example.org/", ["Uncategorized"], 0, 0, false, true],
]

/** ~24 realistic sample sites. No thumbnails (thumb: null) — exercises favicon/letter fallbacks. */
export const FIXTURE_SITES: SavedSite[] = SEEDS.map(
  ([title, url, tags, daysAgo, openCount, pinned, noFavicon], i) => ({
    id: -(i + 1),
    url,
    title,
    favicon: noFavicon ? null : fav(new URL(url).hostname),
    thumb: null,
    tags,
    savedAt: now - daysAgo * DAY - i * 3_600_000,
    openCount,
    pinned: pinned === true,
  })
)
