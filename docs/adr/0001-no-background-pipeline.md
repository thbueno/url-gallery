# No background processing pipeline; capture is synchronous on fav-click

**Status:** accepted

The first draft built a heavy MV3 background pipeline — a debounced service-worker capture loop, an offscreen document for image resize, a durable IndexedDB job queue, and `chrome.alarms` drainers — to auto-screenshot every visited site. We rejected that shape.

Three scope decisions collapse it:
1. **Favorites-only** — a gallery item (**SavedSite**) is created only by an explicit **fav-click**, not by passive browsing. Volume is user-controlled (tens–hundreds), so no LRU/eviction/`storage.persist()` is needed.
2. **Frozen thumbnail** — a thumbnail is captured once at save time and never auto-refreshes, so there is no periodic background work and no service-worker-amnesia problem to engineer around.
3. **Service worker does the image work; content script reads text only** — the content script reads OG/favicon *metadata* (image URL, title, self-declared type) as strings and sends those. The service worker fetches the image bytes (host permission, dodging cross-origin/CORS), resizes via `createImageBitmap` + `OffscreenCanvas` (both available in the worker — no offscreen document), and writes the WebP to Dexie. Resize lives in the worker because Chrome's `runtime.sendMessage` is JSON-only — a `Blob`/`ArrayBuffer` cannot cross the content-script↔worker boundary, so the image must be processed where its bytes already are.

**Consequences:** The service worker is a thin synchronous handler + storage writer with no in-memory pipeline state to lose. No offscreen document. No `chrome.alarms`. No `<all_urls>`. A future reader seeing the minimal background code should not "restore" a pipeline — its absence is deliberate. The cost we accept: thumbnails go stale (user re-saves to refresh) and there is no visual *history* gallery, only saved favorites. If a history gallery is ever added, this ADR must be revisited — that feature reintroduces the rejected pipeline.
