# URL Gallery

A browser extension showing a visual grid of sites the user has explicitly saved. v1 scope is favorites-only: the gallery stores sites the user deliberately keeps, not passive browsing history.

## Language

**SavedSite**:
A site the user explicitly kept by fav-clicking it. The unit stored in the gallery — has a thumbnail, title, URL, favicon, timestamp, and category. This is the only entity the gallery persists.
_Avoid_: bookmark, history item, visited site, page

**Fav-click**:
The explicit user action (button press while a tab is active) that creates a **SavedSite**. The only trigger that writes to the gallery.
_Avoid_: bookmark, save, capture

**History**:
The browser's own visit log, read live via `chrome.history` when shown. Not stored by the extension and not made of **SavedSite**s. A separate, read-through view.
_Avoid_: gallery, saved sites

**Thumbnail**:
The visual image representing a **SavedSite**. Sourced in priority order: OpenGraph image → apple-touch-icon/favicon → (opt-in) screenshot of the active tab.
_Avoid_: screenshot (screenshot is only one possible source, not a synonym)

**Category**:
A named group a **SavedSite** belongs to. Assigned automatically by reading the labels a site publishes about itself (its declared type or site name); falls back to "Uncategorized" when the site says nothing useful. The user can override.
_Avoid_: tag, folder, label, collection

**Open count**:
How many times the user has opened a **SavedSite** by clicking its tile in the gallery. The basis for "most used" ranking and for suggesting pins. Counts gallery opens only, not visits made elsewhere.
_Avoid_: visits, hits, access count

## Flagged ambiguities

- "Gallery" was originally used for both stored favorites and browsing history. Resolved: the **gallery** is favorites-only (**SavedSite**s). **History** is a separate read-through view, never stored.
- "Open tabs" are live, transient browser tabs — not **SavedSite**s and never stored. Cut from v1; if re-added, they are a distinct concept shown as icon tiles, kept separate from the saved gallery.
- "Recommendations" in v1 means resurfacing the user's own **SavedSite**s (unopened / same-category), not suggesting outside sites. True outside discovery is a deferred, opt-in v2 concept.

## Example dialogue

> **Dev:** When the user opens a new tab, do we show their history?
> **Domain:** No — the gallery shows their **SavedSite**s, the ones they fav-clicked. **History** is a different tab, and we read it live from the browser; we never store it.
> **Dev:** So a site only enters the gallery on a **fav-click**?
> **Domain:** Right. No fav-click, no **SavedSite**. That's why we don't need eviction — the user controls the volume.
