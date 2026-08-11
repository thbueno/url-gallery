# Instant Activation: Popup and Gallery-Tab Paint Latency in MV3 Extensions

*Research conducted 2026-08-11. All dates below are page-access dates unless a doc's own last-updated date is shown.*

## Executive summary

**Verdict:** For this stack (Plasmo + React 18 + Dexie), the dominant, controllable cost on both activation paths is *your own JS bundle's parse/eval + first IndexedDB round trip*, not Chrome's popup-creation mechanics — Chrome does not pre-render the popup document before the click, and the service worker's 30-second idle-kill (Chrome's own documented number) means path (B) will frequently pay a cold-start tax that path (A) mostly avoids because clicking the action icon itself is a "wake" event. The single highest-leverage fix for both paths is **synchronous-feeling first paint from a cached snapshot** — write a small JSON snapshot (last N saved sites, counts, category list) to `chrome.storage.session` on every mutation, and have both `popup.tsx` and `tabs/gallery.tsx` render that snapshot immediately on mount while Dexie hydrates in the background — combined with keeping the popup's own JS/CSS payload minimal and non-render-blocking. `chrome.sidePanel` is not a documented performance win over a popup or tab; its documented advantage is persistence across tab navigation, not speed, and it still requires a user gesture to open programmatically. The "popup renderer pre-created on mousedown" claim is widely repeated in developer forums but I could **not** confirm it against a primary Chrome/Chromium source in this research pass — it is filed below as unverified.

---

## 1. Does Chrome pre-warm the popup document before the click? What actually causes perceived delay?

**Verdict: No documented pre-warming of the popup document by Chrome before the click fires; the SW cold start, then your own JS/CSS, are the causes Chrome's own bug tracker and docs point to.**

- [PRIMARY-DOC] `chrome.action` reference: the popup is defined by `default_popup` in the manifest and is shown "when the user clicks on the action's icon" or via `chrome.action.openPopup()` (Chrome 127+; Chrome 118–126 restricted to policy-installed extensions only). No mention anywhere on this page of the popup document being created or rendered ahead of the click. — https://developer.chrome.com/docs/extensions/reference/api/action (accessed 2026-08-11)
- [PRIMARY-DOC] `action.onClicked` "won't be sent if the extension action has specified a popup to show on click of the current tab" — i.e. Chrome's own click-routing logic branches *at click time* between "open popup" and "fire onClicked," which is inconsistent with a popup document already having been created speculatively before the click; if it existed already, routing would look different. — same page, accessed 2026-08-11. Labeled [inferred] for the pre-warming conclusion specifically.
- [SOURCE-CODE, indirect] `chrome.action.openPopup()` requires that it be "called in the same user gesture as the button click" pattern for MV3 (service workers have no access to ambient user gestures) — corroborated by community discussion citing the same constraint. This is consistent with popups being gesture-triggered constructs, not documents that exist independent of a gesture. [SECONDARY] — https://groups.google.com/a/chromium.org/g/chromium-extensions (aggregated search summary, accessed 2026-08-11)
- [SECONDARY, single-source-via-search-snippet — NOT independently fetched] Chromium issue tracker, "Performance issue: Chrome Extension popup shows with delay in some cases" (issue 41290523): a search-engine-indexed excerpt states that popups "should open really quick (0-5ms)" in the ideal case, that real-world delays up to ~1000ms have been reported, and that the specific repro in that bug involved `<link>` (CSS/import) tags in the popup HTML causing delay — inserting the `<link>` tags dynamically after a 1ms delay made the popup "render quickly again." **I could not load the full issue page directly** (issues.chromium.org requires an authenticated session; WebFetch and direct curl both returned a sign-in wall). This is reported at [SECONDARY] confidence — a real Chromium bug report, but read only via a third-party search index, not fetched and read in full by me. — https://issues.chromium.org/issues/41290523 (search-index access 2026-08-11; direct fetch failed)
- [SOURCE-CODE] `Vimium`'s `action.html` (its popup-equivalent page) links three external stylesheets synchronously in `<head>` (`options.css`, `action.css`, `../content_scripts/vimium.css`) with no inlining and no `defer`/`async` — i.e. even a well-regarded, performance-conscious open-source extension does not bother eliminating render-blocking `<link>` tags in its small popup, suggesting in practice this cost is small enough (a few KB of local, cached-by-the-browser CSS) not to be worth defeating. — https://github.com/philc/vimium/blob/master/pages/action.html (accessed 2026-08-11)
- [SOURCE-CODE] uBlock Origin's `popup-fenix.html` also links four separate stylesheets synchronously (`css/themes/default.css`, `css/common.css`, `css/fa-icons.css`, `css/popup-fenix.css`), and instead of trying to paint instantly, it does the opposite: `body.loading { opacity: 0; }` in `popup-fenix.css` — the whole popup body is invisible until JS finishes populating data and removes the `loading` class. This is a deliberate choice to hide an empty/flashing UI rather than to paint a skeleton instantly. — https://github.com/gorhill/uBlock/blob/master/src/popup-fenix.html and https://github.com/gorhill/uBlock/blob/master/src/css/popup-fenix.css (accessed 2026-08-11)

**What actually causes the delay, ranked by what's verifiable:**
1. **Service worker cold start** (verified via Chrome's own lifecycle doc, §4 below) — if the SW was idle-killed, the click first has to spin it back up before the popup can get any data from it.
2. **Bundle parse/eval + framework hydration** — not separately quantified by Chrome docs, but implied by the uBlock/Vimium choice to ship vanilla JS/HTML rather than a component framework in the popup (see §6, "Ranked Techniques").
3. **Render-blocking resources in the popup document itself** — the one concrete, numbered example found (Chromium 41290523, via search index only) is `<link>` tag fetches blocking first paint.
4. **IndexedDB `open()`** — see §3.

## 2. Concrete techniques used in practice

### a) Inline critical CSS / skeleton so first paint precedes JS
[SOURCE-CODE, disconfirming] Neither uBlock Origin nor Vimium inlines its popup CSS or ships a skeleton — both link external stylesheets normally. uBlock actively *hides* the body until JS is ready rather than showing a skeleton. I found no primary Chrome doc recommending inlined critical CSS specifically for extension popups; this is a general web-performance technique ([SECONDARY], web.dev's critical-CSS guidance — https://web.dev/articles/extract-critical-css, accessed 2026-08-11) applied by analogy, not something Chrome documents as extension-specific guidance.

### b) Avoiding a heavy framework / minimal popup JS
[SOURCE-CODE] Both Vimium (`action.js`, vanilla ES module, no framework) and uBlock Origin's popup ship no UI framework. This is the clearest source-code pattern found across both extensions: keep the popup's own execution graph small. No number attached, but qualitatively this removes React's module-eval + reconciler startup cost from the popup's critical path.

### c) `chrome.action.setPopup('')` + `onClicked` → open a tab directly instead of a popup
[PRIMARY-DOC, verified] Confirmed as a real, documented pattern: set `popup: ''` (empty string) via `default_popup` omission or `setPopup()`, and `action.onClicked` fires because "no popup is set"; the handler can then call `chrome.tabs.create()`. — https://developer.chrome.com/docs/extensions/reference/api/action (accessed 2026-08-11). This is directly relevant to path (B) of this project: if the popup's *only* job were "click → open gallery tab," this pattern would let you skip rendering a popup document at all and go straight to `chrome.tabs.create`/`chrome.tabs.update`, paying only the SW wake cost, not a second document's paint cost. It does **not** apply here as-is because this extension's popup does real save-entry-point work (per CLAUDE.md, `popup.tsx` reads metadata) — but it's directly applicable to the toolbar-icon-click-only-opens-gallery scenario if that ever becomes the only popup behavior.

### d) Keeping a tab "warm" (pre-opened/pinned) vs. `chrome.tabs.create` on demand
[unverified/inferred] No Chrome documentation found describing a supported mechanism to pre-render or pre-load a `chrome-extension://` tab page before the user asks for it. `chrome.tabs.create()` always spins up a fresh renderer/document at call time [PRIMARY-DOC implied by absence — the `chrome.tabs` API reference documents no "pre-render" or "warm" tab concept: https://developer.chrome.com/docs/extensions/reference/api/tabs, accessed 2026-08-11]. The only supported alternative is reusing an *already-open* tab (see (f) below) — i.e. "warmth" in practice means "don't close the tab," not "pre-render before open."

### e) Caching last-render state in `chrome.storage.session` for synchronous-feeling first paint
[PRIMARY-DOC, verified — this is the strongest, most directly actionable finding] Chrome's own storage docs describe exactly this pattern under "Asynchronous preload from storage": *"Manifest V3 extensions sometimes need to asynchronously load data from storage before they execute their event handlers"* and give a worked example that populates a global `storageCache` object and has the event handler `await` it before proceeding. — https://developer.chrome.com/docs/extensions/reference/api/storage (accessed 2026-08-11)
- `chrome.storage.session`: **in-memory only, never written to disk**, 10 MB quota (Chrome 111 and earlier: 1 MB), explicitly recommended by Chrome docs as one of the storage areas "we recommend for service workers." [PRIMARY-DOC, verified, exact quote captured]
- Applied to this project: write a small JSON snapshot (e.g. last 20 `SavedSite` summaries + counts) to `chrome.storage.session` from the service worker every time the Dexie store mutates. Both `popup.tsx` and `tabs/gallery.tsx` read this synchronously-fast in-memory value first (a `chrome.storage.session.get()` call, not a full Dexie `open()`), paint it immediately, then reconcile against the real Dexie query when it resolves. This directly targets the IndexedDB-open cost identified in §3.

### f) `chrome.tabs.create` vs. reusing/focusing an existing gallery tab
[PRIMARY-DOC] `chrome.tabs.query()` + `chrome.tabs.update({active: true})` (and `chrome.windows.update({focused: true})` if it's in another window) is the standard, documented way to focus an already-open tab instead of creating a new one. — https://developer.chrome.com/docs/extensions/reference/api/tabs (accessed 2026-08-11). This project's own git history shows this pattern was already implemented (commit `25961fc feat: gallery button, focus existing tab, YouTube thumbnails`) — worth noting this is the correct, Chrome-documented approach and should stay in place; it eliminates a full tab-create + document-paint cycle whenever the gallery tab is already open.

### g) Proactively opening/pre-rendering the tab page from the service worker before the click
[verified-absent] No Chrome API exists to pre-create or pre-render a `chrome-extension://` page invisibly ahead of a user action. `chrome.tabs.create()` requires either an active tab context or runs visibly; there is no "prerender" or "speculative" extension-tab API documented. (Chrome's *web platform* speculation rules API — https://developer.chrome.com/docs/web-platform/prerender-pages, accessed 2026-08-11 — is for prerendering regular web pages a site links to, and is not extension-API-surfaced for `chrome-extension://` pages.) Conclusion: **not possible/documented** for this stack.

## 3. Cost of Dexie/IndexedDB `open()` on a cold MV3 context

**Verdict: not separately quantified by Chrome for extension contexts; the closest number found (9–17ms for IndexedDB init, unrelated app) is not authoritative for this project and should not be cited as fact.**

- [SECONDARY, weak] A search-result summary cited "Initialization time for IndexedDB increases minimally from 9 to 17 milliseconds" and "leader election... about 150 milliseconds," sourced from a general RxDB performance article (https://rxdb.info/slow-indexeddb.html) — this is a **third-party library's own benchmark in a browser tab, not an MV3 service-worker/extension-page context**, and I did not fetch the source page directly to verify the number or its conditions (browser version, disk vs. cache, dataset size all unstated). Labeled [unverified] for this project's purposes — do not treat 9–17ms as a real number for this extension's Dexie cost.
- [inferred] Chrome's own service-worker-lifecycle guidance (§4) implies the real risk isn't IndexedDB's raw open() cost (typically single-digit-to-low-double-digit ms for a small local DB) but that *IndexedDB access from a cold service worker* first pays the SW-wake cost, and separately, a popup/tab's *own* first Dexie `open()` after its document is freshly created also pays a real (if usually small) IndexedDB handshake cost that is entirely avoidable on the critical rendering path by using the `chrome.storage.session` snapshot technique (§2e) for the first paint, then hydrating from Dexie asynchronously — which is exactly the pattern Chrome's storage doc demonstrates for the SW side and generalizes cleanly to the UI side.
- No Chrome or Chromium primary source was found that gives a documented, extension-specific IndexedDB open() latency number. This is a real gap — flagged in §4 (gaps) below.

## 4. Is `chrome.sidePanel` documented as faster than a popup or tab?

**Verdict: No. Chrome does not document sidePanel as faster to open; its documented advantage is persistence, not latency, and it carries the same user-gesture constraint as `openPopup()`.**

- [PRIMARY-DOC, verified] `sidePanel.open()` (Chrome 116+): *"This may only be called in response to a user action."* Same constraint class as `action.openPopup()`. — https://developer.chrome.com/docs/extensions/reference/api/sidePanel (accessed 2026-08-11)
- [PRIMARY-DOC] The side panel "remains open when navigating between tabs (if set to do so)" — its documented value proposition is persistence across navigation, explicitly contrasted with popups which close on outside focus. Nothing in the reference doc claims or implies faster load/initialization than a popup or a tab. — same page, accessed 2026-08-11.
- [PRIMARY-DOC] Lifecycle events `onOpened` (Chrome 141+) and `onClosed` (Chrome 142+) exist but carry no timing/performance semantics beyond "fired when opened/closed."
- Conclusion: sidePanel is a UI-persistence choice, not a performance optimization, per Chrome's own docs. Using it here would not be justified by activation-speed reasoning, only by "should the gallery persist alongside browsing" (a product decision, out of scope for this doc).

## 5. Documented latency numbers for MV3 service worker lifecycle

**Verdict: Chrome documents precise idle-kill thresholds, but does not document a cold-start latency number in milliseconds.**

- [PRIMARY-DOC, verified, exact quotes] From Chrome's service-worker lifecycle doc:
  - *"After 30 seconds of inactivity"* the service worker is terminated. *"Receiving an event or calling an extension API resets this timer."*
  - *"When a single request, such as an event or API call, takes longer than 5 minutes to process"* → terminated.
  - *"When a fetch() response takes more than 30 seconds to arrive"* → terminated.
  - Sending/receiving messages across a WebSocket resets the idle timer; certain user-prompting APIs (`desktopCapture.chooseDesktopMedia()`, `identity.launchWebAuthFlow()`) are allowed to exceed the 5-minute cap.
  - — https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle (accessed 2026-08-11)
- [PRIMARY-DOC] `chrome.alarms` minimum period was relaxed to 30 seconds "to match the service worker lifecycle" (documented as a Chrome 120+ change) — i.e. Chrome explicitly does **not** want extensions using alarms to keep a worker perpetually warm faster than its own idle window; this is a documented anti-pattern boundary, not a recommended warm-keeping technique. This directly reinforces this project's own ADR 0001 (no timers/alarms in the service worker).
- **No millisecond cold-start number is published by Chrome** for how long it takes a service worker to go from "terminated" to "ready to handle its first event." This is a real, acknowledged gap (see below) — do not cite any specific ms figure for MV3 SW cold start as Chrome-documented, because none was found.

---

## Verified vs. Commonly Repeated but Unverified

**Verified (primary source fetched and quoted directly):**
- `action.onClicked` doesn't fire when a popup is configured; fires when popup is `''`. (chrome.action ref)
- `action.openPopup()` requires Chrome 127+ for general availability (118–126 policy-only), and (per community corroboration) a user gesture context.
- `sidePanel.open()` requires a user gesture; sidePanel's documented benefit is cross-tab persistence, not speed.
- Service worker idle-kill: 30s inactivity, 5-minute single-request cap, 30s fetch-response cap; events/API calls reset the timer.
- `chrome.alarms` minimum period is 30s, explicitly aligned to the SW lifecycle (not usable to keep a worker warm faster than its natural cycle).
- `chrome.storage.session` is in-memory-only, 10 MB quota, and is Chrome's own documented pattern for pre-loading data so an event handler (by extension, a UI) doesn't have to block on storage before doing useful work.
- `chrome.tabs.query()` + `tabs.update()` is the documented way to focus an existing tab instead of creating a new one.
- uBlock Origin and Vimium (both real, widely used, source-available extensions) do **not** inline critical CSS or ship a skeleton screen in their popups; uBlock instead hides the whole popup body until JS populates it (`body.loading{opacity:0}`).

**Commonly repeated but I could NOT confirm against a primary source in this pass:**
- **"The popup's renderer/document is created on `mousedown`, before the click event completes"** — this is a claim I went looking for specifically (it's mentioned in various developer forum threads and was in the research brief itself), and I could not find it stated in Chrome's official docs, nor could I load the full text of the one Chromium issue tracker thread most likely to discuss it (41290523 — access blocked by an authentication wall for both WebFetch and direct curl; I only saw a third-party search-engine-indexed excerpt, which did **not** actually contain a mousedown-vs-click claim — it discussed `<link>`-tag render blocking instead). **Verdict: unconfirmed. Do not treat as fact.** If this matters for a future decision, the next step is to read chrome.googlesource.com's UI input-event pipeline docs and `extension_action_view_controller.cc` directly (I attempted this; both `chromium.googlesource.com` direct fetch and the `chromium/chromium` GitHub mirror returned 404 for the paths tried — the file has likely moved or the mirror path is stale — this needs a repo search, not a guessed path, to resolve).
- **A specific millisecond number for MV3 service worker cold start** (e.g., "SW cold start is ~200ms" or similar) — not found in any primary Chrome doc. Any number circulating in blog posts should be treated as unverified until traced to a primary benchmark with a stated Chrome version.
- **"IndexedDB open() costs ~9–17ms"** — traced to a general (non-extension) third-party benchmark (RxDB), not independently verified, and not extension/MV3-specific. Treat as folklore-adjacent, not a citable number for this project.
- **Bitwarden's reported "popup takes seconds to load" bug** (GitHub issue #20439, and its likely-duplicate #19835) turned out, per Bitwarden's own engineering triage, to be tied to a **biometric-unlock-specific bug** (#20929), not a general service-worker-cold-start or bundle-size issue. This is a useful disconfirmation: a real, well-known extension's "slow popup" complaints in the wild were *not* generically about MV3 activation latency — worth remembering before assuming every "slow popup" anecdote online is about cold start. [SOURCE: GitHub issue comments, fetched directly via `gh issue view`, accessed 2026-08-11 — https://github.com/bitwarden/clients/issues/20439 and https://github.com/bitwarden/clients/issues/19835]

---

## Ranked Techniques for This Stack

Stack: Plasmo (controls manifest generation + entry points) + React 18 popup/tab + Zustand + Dexie/IndexedDB via `SavedSiteStore` + Tailwind/shadcn.

**1. `chrome.storage.session` snapshot for first paint (both popup and gallery tab)**
- Buys: eliminates the "blank until Dexie resolves" window on both activation paths — this is the only technique in this report backed by Chrome's own documented, worked pattern (§2e). Qualitatively "instant" first paint since `chrome.storage.session.get()` is an in-memory read, not a disk-backed IndexedDB open+query.
- Cost: low-medium. Requires: (a) a small serializer in `background.ts` that writes a JSON snapshot (last-N sites, counts, active category list) to `chrome.storage.session` on every `SavedSiteStore` mutation; (b) both `popup.tsx` and `tabs/gallery.tsx` (or a shared hook, e.g. `useSnapshotThenHydrate`) read the snapshot synchronously on mount, paint it, then swap in the live Dexie/Zustand-driven result when it resolves.
- Fit: **excellent**. Doesn't touch Plasmo's manifest generation or entry points at all — it's pure application code inside `background.ts` (thin write only, consistent with ADR 0001's "route + write only" rule) and a `lib/` hook. `chrome.storage.session` requires no new permission beyond `"storage"`, which this project already needs for Dexie-adjacent state if any exists, or is a one-line manifest addition Plasmo picks up automatically from a `chrome.storage` import. This is the one technique to actually build.

**2. Keep the popup's own JS/CSS payload minimal; avoid extra synchronous imports on the popup's critical path**
- Buys: qualitative — "avoids adding to the JS-eval cost that's already unavoidable with React," per the uBlock/Vimium source-code evidence that minimal-JS is the pattern real high-quality extensions converge on. No ms number available for React 18 specifically in a Plasmo popup.
- Cost: low — mostly a discipline (don't import the whole `components/ui/*` barrel into the popup if only 2 primitives are used; check Plasmo's popup bundle isn't accidentally pulling in the full gallery grid code).
- Fit: good, and mostly free — verify via `pnpm run dev` build output / Plasmo's bundle analyzer (if present) that `popup.tsx`'s bundle doesn't transitively import `tabs/gallery.tsx`'s heavier grid/virtualization code.

**3. Reuse/focus an existing gallery tab instead of always `tabs.create()`**
- Buys: eliminates a full new-tab-create + fresh-document-paint cycle whenever the gallery is already open. This is Chrome-documented (`tabs.query` + `tabs.update`) and, per this repo's own git log, **already implemented** (commit `25961fc`).
- Cost: none — already done.
- Fit: perfect; no change needed, just confirms the existing implementation is the Chrome-recommended pattern, not a hack.

**4. Do not add `chrome.alarms` or any timer to keep the service worker artificially warm**
- Buys: nothing — Chrome explicitly aligned `chrome.alarms`' minimum period (30s) to the SW's own idle window specifically to prevent this pattern from providing an edge; it would just cost battery/CPU for no activation-latency benefit, and it directly violates this project's own ADR 0001 ("no timers, no alarms... in the service worker").
- Cost: this is a **rejection**, not an addition — cost is the discipline of not reaching for it when a future dev is tempted to "fix" perceived cold-start lag with a keep-alive alarm.
- Fit: **do not build this.** It's the one option this report actively recommends against, and it aligns with an ADR already on record.

**5. `chrome.action.setPopup('') + onClicked → tabs.create/update` (bypass the popup entirely on toolbar click)**
- Buys: removes an entire document's paint cycle from path (A) if/when the toolbar icon's only job becomes "open the gallery" — but currently `popup.tsx` does real save-entry-point work per CLAUDE.md, so this doesn't apply to today's UX without a product change (turning the popup into a pure launcher).
- Cost: low to implement technically, but it's a **product/UX decision** (removing the popup's save-flow from the toolbar-click path), not a pure performance fix — flag to the user/product owner rather than silently building.
- Fit: **conditional** — only pursue if/when the toolbar-icon behavior is redefined to be "always open gallery," which is out of scope for a pure performance pass.

**6. `chrome.sidePanel` as a popup/tab replacement**
- Buys: nothing on the speed axis per Chrome's own docs (§4) — its only documented edge is persistence across tab navigation.
- Cost: would require a real architecture change (side panel entry point, persistent state model) for zero documented latency benefit.
- Fit: **reject for this research question.** Worth a separate product conversation about UX (would a persistent gallery sidebar be nicer than a popup?), but not something to build in service of "instant activation."

**7. Speculative/pre-rendered gallery tab before the click**
- Buys: N/A — not a real, documented capability for `chrome-extension://` pages.
- Cost: N/A.
- Fit: **not available; do not attempt.**

---

## Gaps and what would upgrade this report

- **The mousedown-vs-click popup-creation timing claim is unresolved.** To settle it properly would require either (a) getting past the issues.chromium.org auth wall to read 41290523 in full, or (b) locating the current path of `extension_action_view_controller.cc` (or its Views-layer caller) in the live Chromium source tree via its code-search UI (`source.chromium.org`) rather than a guessed GitHub-mirror path, and reading the button-press handler directly. Both attempts in this pass failed on access, not on the claim being false — so this stays an open question, not a debunked one.
- **No extension-specific, version-pinned millisecond number exists (from any source found) for MV3 service-worker cold-start time or for Dexie `open()` inside a fresh MV3 context.** If this number matters for a go/no-go decision, the only way to get a trustworthy one is to instrument this actual extension (Chrome DevTools Performance panel, "Inspect service worker" cold-start trace) rather than search further — this class of number is highly build/version/machine dependent and not something a documentation search will responsibly produce.
- **This report did not test any of the ranked techniques experimentally** (no code was run or modified, per the task's read-only research scope) — the "instant" characterization of `chrome.storage.session` reads is qualitative/architectural (in-memory API vs. disk-backed IndexedDB), not a measured number for this specific extension.
- **Freshness:** all Chrome docs cited are current as of 2026-08-11 access; `openPopup()`'s Chrome-127 threshold, `sidePanel`'s Chrome-116/141/142 thresholds, and the alarms Chrome-120 threshold are all versioned facts that could shift in future Chrome releases — re-verify version gates before relying on them if this doc is read much later.
