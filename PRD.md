# URL Gallery — Product Requirements Document

**Status:** Draft v1 · **Date:** 2026-06-06 · **Owner:** thbueno
**Source docs:** `Improved plan.md` (settled architecture), `CONTEXT.md` (glossary), `docs/adr/0001-no-background-pipeline.md`

---

## 1. Summary

A browser extension that shows a visual grid of the websites a user has explicitly saved. When the user saves a site, the extension grabs a preview picture once, auto-sorts it into a category from the site's own labels, and stores everything locally. The gallery opens as a page and can optionally replace the New Tab page.

**One line:** A Pinterest-style wall of your favorite sites — you save it, we picture it, it stays on your machine.

## 2. Problem & motivation

Browser bookmarks are text lists — no visual memory, weak grouping, no sense of which saved sites you actually use. Users who keep many references (developers, researchers, shoppers) can't *see* their collection or find things by recognition. Existing "visual" attempts auto-screenshot everything, which is slow, privacy-invasive, and (under Manifest V3) technically broken — `captureVisibleTab` can only snapshot the one active tab and is rate-limited to 2/sec.

**Intended outcome:** a fast, private, visual way to keep and re-find sites you chose to save.

## 3. Goals

- Save a site in one click and see it as a picture tile.
- Find a saved site by sight (grid) or search (title, address, category, site name).
- Auto-group saved sites with zero user effort, overridable.
- Surface the sites you open most; let users pin.
- Keep all data on the user's machine; minimal permissions; no scary install warning.

## 4. Non-goals (explicitly deferred)

- **Browsing-history gallery** — v1 stores only explicitly saved sites, not visited ones.
- **Open-tabs section** — cut from v1.
- **Outside recommendations** (suggesting sites you haven't saved) — deferred to opt-in v2.
- **Auto-refreshing / periodic thumbnails** — pictures are frozen at save time.
- **Full-page screenshots** — favicon/OpenGraph image covers v1; opt-in active-tab screenshot is a later add.

> Rationale for these cuts: they reintroduce a Manifest V3 background-processing pipeline (durable queue, alarms, eviction, broad permissions) that the favorites-only design removes. See ADR 0001.

## 5. Users

- **The Collector** — saves many reference sites; needs visual recall and grouping.
- **The Returner** — repeatedly visits a small set; needs "most used" + pins surfaced.
- Both value privacy and a clean, fast new-tab/landing surface.

## 6. Key concepts (see CONTEXT.md)

- **SavedSite** — a site the user kept via a **fav-click**; the only stored entity (picture, title, URL, favicon, category, timestamp, open count, pinned).
- **Category** — auto-assigned group from the site's own labels; "Uncategorized" fallback; user-overridable.
- **Open count** — times a SavedSite was opened from its tile; basis for "most used".
- **History** — the browser's own visit log, read live when shown, never stored.

## 7. Functional requirements

### 7.1 Saving (fav-click)
- FR-1: An in-page fav button lets the user save the active page in one click.
- FR-2: On save, the page script reads **text only** — preview-image URL (OpenGraph), favicon URL, title, self-declared type.
- FR-3: The service worker fetches the preview image, resizes it to a small WebP, and stores a SavedSite locally (Dexie/IndexedDB).
- FR-4: If the preview image can't be fetched, fall back to the favicon.
- FR-5: Picture is captured **once** and not auto-refreshed; re-saving refreshes it.

### 7.2 Auto-categorization
- FR-6: On save, assign a Category from the site's self-declared type + domain.
- FR-7: When no useful label exists, assign "Uncategorized."
- FR-8: User can move a SavedSite to another Category or create Categories.
- *Known limitation:* most sites only declare "website"/"article", so expect many Uncategorized initially; surface this honestly in the UI.

### 7.3 Gallery view
- FR-9: Display SavedSites as a visual grid (virtualized; lazy-decode; release off-screen picture memory).
- FR-10: Open as a normal extension page, always reachable.
- FR-11: Setting to use the gallery as the New Tab page (opt-in, off by default).
- FR-12: Group/filter by Category.

### 7.4 Find & rank
- FR-13: Search across title, address, Category, and site/company name.
- FR-14: Opening a tile increments its Open count, then navigates.
- FR-15: "Most used" ranking from Open count; suggest pins.
- FR-16: User can pin/unpin SavedSites to the top.
- FR-17: Resurface the user's own saves (unopened lately / more-in-this-category) — the honest "recommendations."

### 7.5 Permissions & privacy
- FR-18: Ship with no broad host permission; request it on first save **from the extension popup** (user-gesture surface). Decline → favicon fallback, still saves.
- FR-19: No `<all_urls>` at install; no history permission; never capture incognito.
- FR-20: All data stays local (IndexedDB). Nothing sent to external services in v1.

## 8. Technical constraints (verified against Chrome docs)

- `captureVisibleTab` snapshots only the active visible tab, rate-limited to 2/sec → no auto-screenshot-everything. (Drives favorites-only + metadata thumbnails.)
- `runtime.sendMessage` is JSON-only → a Blob/picture cannot pass between page script and background → image work lives in the service worker.
- Resize uses `createImageBitmap` + `OffscreenCanvas` in the service worker — no offscreen document.
- `permissions.request` needs a user-gesture surface → first-save prompt from the popup, not the in-page button.
- Service worker is a thin synchronous handler + storage writer — no in-memory state, no alarms, no queue.

## 9. Stack

Plasmo · React + Tailwind + shadcn/ui + Lucide · Dexie (IndexedDB, versioned schema) · service-worker canvas resize.

## 10. Success metrics

- **Activation:** % of installs that save ≥1 site in first session.
- **Engagement:** median SavedSites opened from the gallery per week (proves recall value).
- **Retention:** % using the gallery (or New-Tab takeover) 7/30 days after install.
- **Trust:** install→keep rate; % granting the broad permission on first save.
- **Quality:** % of saves that land in a real Category (vs Uncategorized).

## 11. Milestones

1. **M1 — Save & see:** Plasmo scaffold, Dexie schema, fav button, worker fetch+resize, basic grid.
2. **M2 — Organize:** auto-Categories, manual override, search.
3. **M3 — Rank:** Open count, "most used," pins, resurface-own-saves.
4. **M4 — Polish:** New-Tab opt-in, first-save permission flow, virtualization/memory, empty/decline states.

## 12. Risks & open questions

- **R1:** Auto-categorization may be weak (metadata is thin). *Mitigation:* domain heuristics + honest "Uncategorized" + easy manual move.
- **R2:** Users may decline broad permission. *Mitigation:* favicon fallback keeps the app fully usable.
- **R3:** New-Tab takeover draws extra store scrutiny. *Mitigation:* off by default, opt-in only.
- **OQ-1:** WebP thumbnail dimensions/quality target? (proposed 400×300 @ ~0.6)
- **OQ-2:** Storage soft-cap even though favorites-only? (volume is user-controlled; likely none in v1)
- **OQ-3:** Does the user want an opt-in active-tab screenshot fallback in v1, or strictly metadata?
