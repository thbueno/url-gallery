# PROTOTYPE — BoardUI restyle of the gallery (throwaway, branch `prototype/boardui-restyle`)

> Three structurally different BoardUI-based variants of the gallery tab, switchable via `?variant=A|B|C`
> on the existing `tabs/gallery.html` route, plus a live Tweaks panel (palette + radius + light/dark)
> that re-themes every component at once. Dev builds only.

Source of truth for the look: `prototype-refs/boardui-summary.md` (BoardUI design system tokens).
BoardUI essence: neutral greys carry the UI, ONE saturated accent; cards are grey sections on a white
page with no border/shadow; controls get a 1px border + a tiny shadow; the primary button is the only
filled gradient; Inter at medium weight, tabular numbers; quiet, product-literal, tactile in small ways.

## Architecture (shared infra — built first)

All prototype code lives in `src/components/prototype-boardui/` (the folder name marks it throwaway).

```
src/components/prototype-boardui/
  GalleryPrototype.tsx   ← loads real data from the existing stores, renders the active variant,
                           the switcher and the Tweaks panel
  PrototypeSwitcher.tsx  ← floating bottom-centre pill: ← label →, ←/→ keys (not when typing),
                           updates ?variant= with history.replaceState
  TweaksPanel.tsx        ← floating panel (bottom-right, collapsible): palette swatches,
                           radius slider + presets, light/dark toggle, and a readout of the
                           current values (palette id, mode, --radius px)
  theme.ts               ← palette presets + applyTheme(palette, mode, radiusPx)
  useSites.ts            ← real sites/tags from useGalleryStore / useTagSettingsStore;
                           falls back to fixtures.ts when the store is empty
  fixtures.ts            ← ~24 realistic sample SavedSites (no thumbnails needed; use favicon/letter)
  variants/VariantA.tsx, VariantB.tsx, VariantC.tsx  (each exports `name`)
```

Wiring in `src/tabs/gallery.tsx`: rename the current default export to `Gallery`, add a new default
export that returns `<GalleryPrototype />` when `process.env.NODE_ENV === "development"` AND
`new URLSearchParams(location.search).has("variant")`; otherwise `<Gallery />`. No other change
to the real gallery. Without `?variant=` the app is untouched.

### Theming mechanism (this is what makes "change everything at once" work)

- `applyTheme()` writes CSS custom properties as **inline style on `document.documentElement`**
  (inline wins over `html.dark`, `html.light` and the media query in `src/style.css`). It also sets
  the `dark`/`light` class on `<html>` for consistency. State lives in memory only (no persistence).
- Each palette defines the FULL shadcn variable set from `src/style.css` (background, foreground, card,
  popover, primary, secondary, muted, accent, destructive, border, input, ring, sidebar-*, chart-1..5,
  thumb-scrim, card-hover-ring …) for BOTH light and dark, in the same bare-HSL-triplet format
  `style.css` uses. Also prototype-only vars: `--surface-section` (BoardUI grey section),
  `--primary-gradient-from/-to`, `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-pop`.
- Radius: one input `radiusPx` (0–28). applyTheme derives `--radius`, `--radius-sm`, `--radius-lg`,
  `--radius-xl`, `--radius-card` (keep the ratios `style.css` already implies; if it uses literals,
  use sm=0.6r, lg=1.35r, xl=1.75r, card=1.5r). Presets: Sharp 0 · Crisp 4 · BoardUI default (from
  summary) · Soft 14 · Round 22.
- Fonts: inject a Google Fonts `<link>` for Inter (+ any mono BoardUI uses) at runtime from
  GalleryPrototype and set `--font-sans` via applyTheme.
- Palettes (5): **Board Blue** (exact BoardUI values from the summary — the default), **Graphite**
  (warm neutral, near-black accent, monochrome luxury), **Sage** (green-grey neutrals, deep sage
  accent), **Ember** (warm stone neutrals, burnt-amber accent), **Iris** (cool neutrals, indigo-violet
  accent). Every palette keeps the BoardUI rule: greys do the work, one accent. Contrast: body text
  ≥ 4.5:1, muted text ≥ 4.5:1 on background and on `--surface-section`.

### Rules every variant must follow

- Consume tokens ONLY: Tailwind colour utilities (`bg-background`, `text-muted-foreground`, …),
  `bg-[hsl(var(--surface-section))]`, `shadow-[var(--shadow-xs)]`, `rounded-sm|md|lg|xl|card`.
  **No hex, no px font sizes, no hardcoded radius, no `rounded-full`** (except true circles like
  status dots/avatars) — otherwise the Tweaks panel can't reach it.
- Use existing shadcn primitives in `src/components/ui/` (Button, Input, DropdownMenu, Skeleton…).
- Read-only: clicking a site opens its URL in a new tab; no delete/pin/tag mutations (show the
  affordances, wire them to no-ops).
- Real data via `useSites()`; must look good with 0 thumbnails (favicon / letter-mark fallback) and
  with real thumbnails (`site.thumb` blob → object URL, revoke on unmount).
- Variants must not share a layout component. Small shared bits (SiteThumb, Favicon) are fine.
- Premium details: tabular-nums for counts/dates, optical alignment, 150–200ms ease-out hovers,
  subtle press scale (0.98) on buttons, image outlines (1px inset `--border` at low alpha),
  text-wrap: balance on headings, no layout shift on hover.

## The three variants (structurally different on purpose)

### A — "Atelier" (refined sidebar + gallery grid; the faithful BoardUI translation)
Left sidebar as a grey `--surface-section` panel inset from the page edge with its own radius:
brand mark, a ⌘K-style search trigger, tag list with tabular counts and a quiet active state
(white chip + 1px border + shadow-xs), theme toggle at the bottom. Main canvas is pure background
with generous whitespace: page header (title "Gallery", count, sort dropdown, primary gradient
"Save site" button). A "Pinned" strip of 3–4 larger cards, then the grid. Cards are grey sections
(no border, no shadow) with the thumbnail inset by a few px and an inner radius
(inner = outer − inset), title medium weight, domain + favicon in muted text, hover lifts the
thumbnail slightly.

### B — "Bento" (no sidebar; usage-driven dashboard)
Top bar: brand, a segmented control (tabs) for tags — overflow into a "More" dropdown — and search
on the right. Below: a bento grid with mixed tile sizes — one 2×2 hero tile for the most-opened site,
a "Most opened" ranked list tile (rank, favicon, title, opens in tabular numbers, a thin bar showing
relative opens), a "Recently saved" tile, a stat tile row (total sites, tags, opens this week). Then
each tag as a horizontal shelf (scroll-snap row of compact cards) with a "See all" link. Hierarchy
is driven by openCount and savedAt, not by the tag list.

### C — "Index" (dense three-pane list + inspector; for scanning, not browsing)
Narrow icon rail on the left (tags as icons/letters with tooltips), a middle table/list: favicon,
title, domain, tag chips, opens, saved date — sortable column headers, sticky header, row hover in
`--surface-section`, selected row with accent left indicator. Right inspector pane: large thumbnail,
title, URL, tags, stats, and actions (Open, Pin, Copy link, Delete as no-ops). `j`/`k` or ↑/↓ moves
selection (not when typing), Enter opens. Search filters the list live.

## Done means

- `pnpm exec tsc --noEmit` passes for prototype files, `pnpm run lint` clean on prototype files.
- `pnpm run dev` compiles; `tabs/gallery.html?variant=A|B|C` renders each variant; Tweaks panel
  changes palette, radius and mode across ALL components live; switcher + keys work.
- Without `?variant=` the original gallery renders unchanged.
