# URL Gallery — Build Guide

Step-by-step prompts for building the project in issue order.
Model assignments: **Sonnet** for complex/integration work, **Haiku** for pure/mechanical tasks.

---

## Phase 0 — Before anything

Verify tooling is ready:

```
! pnpm --version
! node --version
```

Both must return a version. If pnpm is missing: `! npm install -g pnpm`.

---

## Phase 1 — Scaffold (Issue #1)

**Model: Sonnet**

> Use `/react-shadcn-stack` to scaffold this project. Use **pnpm** (not npm). Stack: Plasmo MV3, React, Tailwind, shadcn New York + Zinc, TypeScript strict mode, Biome linter, `@/` → `src/` path alias, simple-git-hooks + lint-staged pre-commit hook.
>
> After scaffolding, verify the manifest has only `storage` + `tabs` in required permissions and broad host access in `optional_host_permissions` only — no `<all_urls>`, no `history` permission.
>
> This is issue #1.

**Verify before moving on:**
- `pnpm run dev` produces a loadable unpacked extension in Chrome
- `chrome://extensions` → load unpacked → no permission warnings beyond storage/tabs
- `pnpm exec @biomejs/biome check .` passes

---

## Phase 2 — Design system (Issue #2)

**Model: Sonnet** *(HITL — you will be asked to confirm token values)*

> Use `/frontend-design` to build the design-system scaffold for this project:
>
> 1. `src/style.css` — single source of truth for all design tokens. CSS custom properties for: color palette (Zinc base), font family, font-size scale, border radius (0.5rem). Dark mode via `@media (prefers-color-scheme: dark)` only — no toggle.
> 2. `src/tabs/design-system.tsx` — Plasmo tab route. Render every installed shadcn primitive against live tokens. Gate the entire page content on `process.env.NODE_ENV === 'development'`. Do not link it from any user surface.
>
> All components must consume tokens from `src/style.css` via Tailwind utilities or `var(--token)`. No hardcoded hex, size, or radius values anywhere.
>
> This is issue #2.

**What you decide here (HITL):**
- Review the token values Claude proposes — adjust palette/typography if needed
- Confirm dark mode looks correct by switching OS preference

---

## Phase 3 — Foundation modules (Issues #3–7, run in parallel branches)

These are independent. Open multiple terminals or sessions.

---

### 3a — SavedSiteStore (Issue #3)

**Model: Sonnet** *(Dexie + fake-indexeddb complexity)*

> Use `/tdd` to build `src/lib/store.ts` — a Dexie SavedSiteStore.
>
> Schema: `db.version(1).stores(...)` with fields `id, url, title, favicon, thumb, category, savedAt, openCount, pinned`. Indexes on `category`, `pinned`, `openCount`, and a search field.
>
> Expose: `add`, `getAll`, `getById`, `update`, `delete`, `search(query)` across title/url/category/siteName, `incrementOpenCount(id)`, `setPinned(id, bool)`.
>
> Tests use `fake-indexeddb`. Assert: full CRUD, search returns correct matches, `incrementOpenCount` is monotonic, pin/unpin toggles, `thumb` blob round-trips intact.
>
> New fields in future go in a new `db.version(N)` block — never mutate version 1.
>
> This is issue #3.

---

### 3b — MetadataExtractor (Issue #4)

**Model: Haiku** *(pure function, HTML fixtures)*

> Use `/tdd` to build `src/lib/metadata-extractor.ts`.
>
> Pure function that reads the DOM and returns `{ imageUrl, faviconUrl, title, type }` as strings only — no image bytes, no fetch, no canvas.
>
> Priority order for image: OpenGraph `og:image` → `apple-touch-icon` → `/favicon.ico`.
> Priority order for title: `og:title` → `<title>`.
> Type from: `og:type` → default undefined.
>
> Missing fields return `undefined`, never throw.
>
> Tests use HTML string fixtures injected into jsdom. Assert each field resolves from the correct source, falls back correctly, and handles missing tags gracefully.
>
> This is issue #4.

---

### 3c — Categorizer (Issue #5)

**Model: Haiku** *(pure function, table-driven)*

> Use `/tdd` to build `src/lib/categorizer.ts`.
>
> Pure function signature: `categorize(type: string | undefined, siteName: string | undefined, domain: string) → Category`.
>
> Category is a string union — define reasonable categories (e.g. "Video", "News", "Social", "Shopping", "Dev Tools", "Docs", "Design", "Uncategorized").
>
> Logic: map known OG types (video.*, music.*) to categories; apply domain heuristics for generic types ("website"/"article"); fall back to "Uncategorized" when nothing useful is declared.
>
> Tests are table-driven Vitest: rows of (type, siteName, domain) → expected Category. Cover: explicit OG type match, domain heuristic hit, full fallback to "Uncategorized".
>
> No I/O. No network. Deterministic.
>
> This is issue #5.

---

### 3d — ThumbnailService (Issue #6)

**Model: Sonnet** *(canvas mocking + WebP + fallback logic)*

> **Before starting:** decide on WebP dimensions + quality. The PRD proposes 400×300 @ quality 0.6. Confirm or adjust — this value will be locked in by the tests.
>
> Use `/tdd` to build `src/lib/thumbnail-service.ts`.
>
> Function runs in the service worker context. Signature: `fetchAndResize(imageUrl: string, faviconUrl: string): Promise<Blob>`.
>
> Flow: fetch `imageUrl` → `createImageBitmap` → `OffscreenCanvas` resize to [decided dimensions] → `canvas.convertToBlob({ type: 'image/webp', quality: [decided quality] })`. On any fetch or decode failure, fall back to fetching `faviconUrl` and doing the same resize. No offscreen document.
>
> Tests mock `fetch` and `OffscreenCanvas`. Assert: happy path returns WebP Blob at correct dimensions, failure of preview fetch triggers favicon fallback, fallback also returns a valid WebP Blob.
>
> This is issue #6.

---

### 3e — Message contracts (Issue #7)

**Model: Haiku** *(type definitions + Zod schemas)*

> Build `src/lib/messages.ts`. No `/tdd` needed — this is a type + schema file.
>
> Define all content-script ↔ service-worker messages as a TypeScript discriminated union. Each member must have a `type` string literal field. Export a Zod schema for each member.
>
> Required message for v1:
> ```ts
> type SaveRequest = {
>   type: 'SAVE_REQUEST'
>   url: string
>   title: string
>   imageUrl: string | undefined
>   faviconUrl: string | undefined
>   declaredType: string | undefined
> }
> ```
>
> No Blob, ArrayBuffer, or binary fields anywhere — JSON-only.
>
> Export a `parseMessage(raw: unknown)` helper that uses Zod to parse and returns the typed union or throws. The service worker must call this before acting on any message.
>
> Add a type-level test (or inline `satisfies` assertion) confirming a malformed payload fails the parse.
>
> This is issue #7.

---

## Phase 4 — First demoable slice (Issue #8)

**Model: Sonnet** *(cross-cutting integration — the hardest issue)*

> Wire the first end-to-end save. Three files to build/complete:
>
> **`src/contents/fav-button.tsx`** — Plasmo content script. Inject a fav button onto every active page. On click: call MetadataExtractor to read `{ imageUrl, faviconUrl, title, declaredType }` from the current DOM, then send a `SAVE_REQUEST` message to the background via `chrome.runtime.sendMessage`.
>
> **`src/background.ts`** — Plasmo service worker. On receiving a message: parse it with `parseMessage` from `src/lib/messages.ts`. On `SAVE_REQUEST`: call ThumbnailService to fetch + resize the thumbnail, call Categorizer to assign a Category, write a SavedSite to SavedSiteStore. Thin synchronous handler — no timers, no alarms, no in-memory state.
>
> **Minimal gallery page** — bare list (no virtualization yet) that reads all SavedSites from Dexie and renders title + thumbnail. This gets replaced in issue #10.
>
> After building, load the extension and manually verify:
> - Click fav button on a page with an OG image on another domain → thumbnail saves cleanly
> - Reload extension page → site still appears
> - Visit a page without clicking → nothing saved
>
> This is issue #8.

---

## Phase 5 — Popup + permission flow (Issue #9)

**Model: Sonnet** *(permission UX, HITL — review the decline state)*

> Build the extension popup at `src/popup.tsx`.
>
> Behavior: if broad host permission has not been granted yet, show a "Grant permission for better thumbnails" prompt that calls `chrome.permissions.request`. Declining is fine — the app falls back to favicon-only mode silently. Do not re-prompt if permission was already granted or explicitly denied.
>
> Also include a "Save this tab" button as a manual save entry point (mirrors the fav-click flow but triggered from the popup).
>
> Use shadcn primitives for all UI. All new primitives must also be added to `src/tabs/design-system.tsx` in this same PR.
>
> This is issue #9.

**What you review (HITL):** the decline/favicon-only state — confirm the messaging is honest without being alarming.

---

## Phase 6 — Virtualized gallery grid (Issue #10)

**Model: Sonnet** *(major UI surface — use `/frontend-design`)*

> Use `/frontend-design` to replace the minimal list from issue #8 with a production-quality virtualized gallery grid.
>
> Requirements:
> - Virtualized grid (use a library like `@tanstack/react-virtual` or similar) — 1000+ items scroll smoothly, off-screen image memory released
> - Opens as a normal extension page (always reachable)
> - Clicking a tile calls `SavedSiteStore.incrementOpenCount(id)` then navigates to the URL
> - Zustand store for gallery UI state (active SavedSites list, search query string, active category filter). Slices wrap Dexie queries — no data duplication. No React Context for state that Grid, Search, or CategoryFilter share.
>
> Reference the mockups in `ui-refs/` for layout direction.
>
> All new primitives added to `src/tabs/design-system.tsx` in this PR.
>
> This is issue #10.

---

## Phase 7 — Categories (Issue #11)

**Model: Sonnet**

> Wire Categorizer into the save path and add category UI.
>
> 1. In `src/background.ts`: after thumbnail, call `categorize(declaredType, siteName, domain)` and include the result when writing the SavedSite to Dexie.
> 2. Add a CategoryFilter component to the gallery page — filter the grid by Category using the Zustand active-category slice.
> 3. Add inline category override on each tile — user can pick a different Category from a dropdown (or similar) and the change persists via `SavedSiteStore.update`.
> 4. Surface "many sites may be Uncategorized" honestly in the UI — small explainer near the filter.
>
> All new primitives added to `design-system.tsx`.
>
> This is issue #11.

---

## Phase 8 — Search (Issue #12)

**Model: Haiku** *(additive — just wires a Zustand slice to a Dexie query)*

> Add a search input to the gallery page.
>
> - Input updates the `searchQuery` Zustand slice
> - Grid re-renders filtered results live using `SavedSiteStore.search(query)` — no in-memory copy
> - Search covers: title, URL, category name, site/company name
>
> Use a shadcn Input primitive. Add it to `design-system.tsx`.
>
> This is issue #12.

---

## Phase 9 — Pin, ranking, resurface (Issue #13)

**Model: Sonnet**

> Add three related features to the gallery:
>
> 1. **Pin/unpin** — pin icon on each tile; pinned tiles float to the top of the grid. Calls `SavedSiteStore.setPinned(id, bool)`.
> 2. **Most used** — sort option that ranks by `openCount` descending.
> 3. **Resurface** — a small section (collapsible or sidebar) showing SavedSites the user hasn't opened lately, or sites from the same Category as recently-opened ones. No external recommendations — only the user's own saved data.
>
> All new primitives added to `design-system.tsx`.
>
> This is issue #13.

---

## Phase 10 — Polish (Issue #14)

**Model: Sonnet** *(HITL — review empty + decline states)*

> Add the final polish layer:
>
> 1. **New-Tab takeover** — opt-in setting in the popup or options page. Off by default. When on, registers the gallery as the new tab page.
> 2. **Empty state** — shown when no SavedSites exist; prompts to fav-click something.
> 3. **Decline state** — when permission was declined, explain favicon-only mode in the gallery and offer a link to grant it later.
> 4. **Memory stress test** — manually verify 1000+ items scrolling with no visible memory growth (open DevTools Memory tab).
>
> All new primitives added to `design-system.tsx`.
>
> This is issue #14.

---

## Model assignment summary

| Issue | Title | Model |
|---|---|---|
| #1 | Plasmo scaffold | Sonnet |
| #2 | Design-system scaffold | Sonnet |
| #3 | SavedSiteStore TDD | Sonnet |
| #4 | MetadataExtractor TDD | **Haiku** |
| #5 | Categorizer TDD | **Haiku** |
| #6 | ThumbnailService TDD | Sonnet |
| #7 | Message contracts | **Haiku** |
| #8 | Tracer bullet end-to-end save | Sonnet |
| #9 | Popup + permission flow | Sonnet |
| #10 | Virtualized gallery grid | Sonnet |
| #11 | Categories | Sonnet |
| #12 | Search | **Haiku** |
| #13 | Pin / ranking / resurface | Sonnet |
| #14 | New-Tab + polish | Sonnet |

---

## Rules to repeat in every session

Paste this at the start of any new Claude session on this project:

> Read CLAUDE.md before writing any code. Use pnpm (not npm). Use `@/` path alias for all internal imports. All design tokens in `src/style.css` only — no hardcoded hex, sizes, or radii in components. Any PR that adds a UI primitive must also update `src/tabs/design-system.tsx`.

---

## Dependency graph (quick reference)

```
#1 (scaffold)
├── #2 design system
├── #3 SavedSiteStore
├── #4 MetadataExtractor
├── #5 Categorizer
├── #6 ThumbnailService
└── #7 Message contracts
         └── #3 + #4 + #6 + #7 → #8 tracer bullet
                                   ├── #9 popup
                                   └── #10 grid
                                         ├── #11 categories ← needs #5
                                         ├── #12 search
                                         └── #13 pin/ranking ← needs #11
                                   #9 + #10 → #14 polish
```
