# Fav-click moves to toolbar icon; floating content-script button removed

**Status:** accepted

The v1 fav-click trigger was a floating `<button>` injected into every page via content script. We removed it for two reasons: it overlaps page content (z-index wars, visual noise) and it requires `<all_urls>` host permissions upfront, which triggers a scary permissions prompt on install.

The replacement trigger is the **extension toolbar icon**. Clicking the icon while a tab is active fires the same fav-click flow (metadata extract → service worker → Dexie write). This is the pattern used by 1Password, Pocket, and Raindrop — users already expect it.

**Considered alternative: keep the floating button as opt-in.** Rejected — two save surfaces with identical behaviour adds confusion and doubles the surface area to maintain.

**Bookmark import** is added as a separate, opt-in feature: a one-time operation that reads the browser's native bookmarks tree, lets the user pick a folder, and bulk-creates SavedSites. It does not establish ongoing sync — the gallery and browser bookmarks are independent after import. This is not a replacement for fav-click; it is a migration path for users who already have bookmarks they want to import.

ADR 0001 (no background pipeline) is unaffected. The toolbar click is synchronous on user action; the bookmark import is a one-shot user-initiated write, not a background process.
