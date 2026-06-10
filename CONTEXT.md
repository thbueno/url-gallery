# URL Gallery

A browser extension showing a visual grid of sites the user has explicitly saved. v1 scope is favorites-only: the gallery stores sites the user deliberately keeps, not passive browsing history.

## Language

**SavedSite**:
A site the user explicitly kept by fav-clicking it. The unit stored in the gallery — has a thumbnail, title, URL, favicon, timestamp, and one or more **Tags**. This is the only entity the gallery persists.
_Avoid_: bookmark, history item, visited site, page

**Fav-click**:
The explicit user action that creates a **SavedSite**. Triggered via the extension toolbar icon while a tab is active. No floating in-page button.
_Avoid_: bookmark, save, capture

**Bookmark import**:
A one-time, user-initiated operation that reads the browser's native bookmarks tree, lets the user pick a folder, and bulk-creates **SavedSite**s from those URLs. Does not establish an ongoing sync — bookmarks and gallery are independent after import.
_Avoid_: sync, live import, auto-capture

**History**:
The browser's own visit log, read live via `chrome.history` when shown. Not stored by the extension and not made of **SavedSite**s. A separate, read-through view.
_Avoid_: gallery, saved sites

**Thumbnail**:
The visual image representing a **SavedSite**. Sourced in priority order: OpenGraph image → apple-touch-icon/favicon → (opt-in) screenshot of the active tab.
_Avoid_: screenshot (screenshot is only one possible source, not a synonym)

**Tag**:
A label a **SavedSite** belongs to. A site can have one or more tags. Tags are assigned automatically by reading the labels a site publishes about itself (its declared type or site name); falls back to "Uncategorized" when the site says nothing useful. The user can add, rename, remove, or pin tags.
_Avoid_: category, folder, label, collection

**Tag filter**:
Filtering the gallery by one or more selected **Tags**. Uses OR semantics — a site matches if it has *any* of the selected tags. Selecting no tags shows all sites.
_Avoid_: category filter

**Pinned tag**:
A **Tag** the user has promoted to the top bar as a quick-access chip. Clicking a pinned-tag chip activates the same **Tag filter** as clicking the tag in the sidebar. Pinned tags are a display preference only — they do not change filtering semantics. Primary use: fast navigation when the sidebar is collapsed.
_Avoid_: favorited tag, bookmarked tag

**Open count**:
How many times the user has opened a **SavedSite** by clicking its tile in the gallery. The basis for "most used" ranking and for suggesting pins. Counts gallery opens only, not visits made elsewhere.
_Avoid_: visits, hits, access count

## Flagged ambiguities

- "Gallery" was originally used for both stored favorites and browsing history. Resolved: the **gallery** is favorites-only (**SavedSite**s). **History** is a separate read-through view, never stored.
- "Open tabs" are live, transient browser tabs — not **SavedSite**s and never stored. Cut from v1; if re-added, they are a distinct concept shown as icon tiles, kept separate from the saved gallery.
- "Recommendations" in v1 means resurfacing the user's own **SavedSite**s (unopened / same-tag), not suggesting outside sites. True outside discovery is a deferred, opt-in v2 concept.
- "Category" was the v1 term for what is now **Tag**. Resolved: renamed to Tag; a SavedSite now holds `tags: string[]` not `category: string`.
- Tag management is split: per-site tags use a checkbox dropdown on the card; taxonomy management (add/rename/delete tag names) lives in a "Manage tags" sheet accessible from the sidebar footer. Deleting a tag falls back affected sites to "Uncategorized".
- Tag-filter transitions use Framer Motion AnimatePresence with row-level stagger (30ms per row). Individual card stagger not used — virtualizer renders rows, not cards.

## Example dialogue

> **Dev:** When the user opens a new tab, do we show their history?
> **Domain:** No — the gallery shows their **SavedSite**s, the ones they fav-clicked. **History** is a different tab, and we read it live from the browser; we never store it.
> **Dev:** So a site only enters the gallery on a **fav-click**?
> **Domain:** Right. No fav-click, no **SavedSite**. That's why we don't need eviction — the user controls the volume.
