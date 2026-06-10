# URL Gallery — Settled Plan (v3, post-grill)

A browser extension showing a visual grid of sites the user explicitly saved. This v3 reflects decisions made during the design grilling. Glossary in `CONTEXT.md`; architecture rationale in `docs/adr/0001-no-background-pipeline.md`.

> **One-line shape:** A site enters the gallery only when the user saves it. We grab its picture once, sort it by what the site says about itself, and store it locally. No background processing, no browsing tracking.

---

## Settled decisions

1. **Favorites-only.** The gallery stores only sites the user deliberately saved (a **SavedSite**), not passive history. Volume is user-controlled, so no eviction/pruning/persistence gymnastics needed. Browser **History** is a separate, read-through view (read live, never stored).
2. **Frozen thumbnail.** A site's picture is captured once at save time and never auto-refreshes. The user re-saves to refresh. → no background scheduling at all.
3. **Service worker does the image work; the page script reads text only.** The injected fav button reads only text about the site (preview-image address, title, self-declared type) and sends that. The service worker fetches the image, resizes it, and stores it. (Required, not preference: a picture/binary blob cannot be passed between the page script and the background — those messages are text-only — so the image must be handled where its bytes already are.) No offscreen document, no background queue, no alarms.
4. **Cross-origin images via the service worker.** A site's preview image usually lives on another server, which the page script can't fetch cleanly. The service worker fetches it (with the host permission) and resizes it on its own canvas — no broken/blank pictures.
5. **Permissions asked at save time, from the extension's popup.** Ship with no broad "all sites" permission. On the first save, the request is made from the extension's own little popup window (the in-page button may not be allowed to ask). Decline → fall back to the site's small favicon. No scary install warning.
6. **Auto-sort by the site's own labels.** On save, read the type/site-name a page publishes about itself, combined with its domain, and drop it into a matching **Category**; "Uncategorized" when the site says nothing useful. Local, instant, no AI, no internet. *Reality check: most sites only declare themselves as "website" or "article", so expect many to land in Uncategorized at first — the domain helps, but rich auto-sorting is limited by what sites actually publish. Set this expectation in the UI.*
7. **"Most used" = gallery opens.** Clicking a tile to open a site adds one to its **Open count**. No browsing-history tracking. Used for ranking and pin suggestions.
8. **Recommendations cut from v1.** Instead, resurface the user's own saved sites (unopened lately / more-in-this-category). Real outside discovery is a deferred, opt-in v2.
9. **Gallery is a normal page; New-Tab takeover is opt-in.** Always reachable as a page; "use as my New Tab" is a setting the user turns on.
10. **Open-tabs section cut from v1.** Focus on the saved gallery.

---

## v1 feature set (final)

- Save a site (fav button) → picture + title + icon + **Category** stored.
- Visual grid of **SavedSite**s, opens as a page (optional New-Tab takeover).
- Auto-sort into **Categories**; user can override / make their own.
- Search across title, address, **Category**, and site/company name.
- Pin sites; "most used" ranking from **Open count**; suggest pins.
- Resurface own saved sites (the honest "recommendations").

**Explicitly deferred:** browsing-history gallery, open-tabs section, outside recommendations, periodic/auto thumbnail refresh, screenshots (favicon/OG cover v1; opt-in active-tab screenshot is a later add).

---

## Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Plasmo | Manifest abstraction, React + reload. |
| UI | React + Tailwind + shadcn/ui + Lucide | Virtualized grid. |
| Storage | Dexie (IndexedDB) | For storing picture data + searchable fields. Versioned schema from day one. |
| Image resize | In the service worker (`createImageBitmap` + `OffscreenCanvas`) | Page script never touches the picture bytes. |

## How a save works (the only pipeline)

```
User clicks fav button (content script, page is active)
  → content script reads TEXT ONLY: preview-image URL + title + favicon URL + self-described type
  → content script sends that text to the service worker
  → (first save) extension popup asks permission to fetch from other sites
  → service worker fetches the image bytes
  → service worker resizes (createImageBitmap + OffscreenCanvas) → small WebP picture
  → service worker writes SavedSite to Dexie (picture, title, url, icon, category, timestamp)
```

No timers, no background document, no queue, no history listeners. The picture never crosses the page↔background boundary (it can't — those messages are text-only).

## Storage shape (Dexie, versioned)

`SavedSite`: `id, url, title, favicon, thumb(WebP blob), category, savedAt, openCount, pinned`. Indexes on `category`, `pinned`, `openCount`, and a search field. Define `version().stores()` from v1 so the schema can evolve.

## UI notes

- Virtualize the grid; lazy-decode pictures; release picture memory when tiles scroll off (avoid leaks).
- Open-from-tile increments **Open count** then navigates.

## Permissions

- `storage`, `tabs` (read active tab info), content-script injection for the fav button.
- Broad host access lives in **optional** permissions, requested on first save **from the extension popup** (a user-gesture surface). No `<all_urls>` at install.
- No history permission, no `<all_urls>` up front, no incognito capture.

## Build order

1. Plasmo scaffold + Dexie schema (versioned).
2. Content script fav button: read TEXT ONLY — preview image URL / icon URL / title / self-label — and send to the service worker.
3. Service worker: fetch the image bytes, resize (`createImageBitmap` + `OffscreenCanvas`) → WebP, write SavedSite to Dexie.
4. Extension popup: first-save permission request (and a manual save entry point).
5. React gallery page: virtualized grid, open-from-tile + **Open count**.
6. Auto-sort into **Categories** from self-labels; manual override.
7. Search; pin + "most used"; resurface-own-saves.
8. Optional New-Tab takeover setting; first-save permission prompt.

## Verification

- Save a site whose preview image is on another server → picture stores cleanly (no broken/blank image).
- Decline the permission prompt → falls back to the favicon, still saves.
- Save sites of different self-described types → land in the right **Category**; a site with no labels → "Uncategorized".
- Open a tile several times → its **Open count** rises and it climbs the "most used" list.
- Confirm nothing is written for sites the user merely visits (favorites-only).
- 1000+ saved sites scroll smoothly; picture memory is released off-screen.

---

## Superseded

- `First plan draft.md` — original; broken capture premise.
- v2 of this file — pre-grill; assumed history+favorites and a background pipeline. Replaced by the favorites-only, no-pipeline shape above (see ADR 0001).
