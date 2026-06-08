# URL Gallery — Session Handoff

**Date:** 2026-06-08  
**Branch:** `main`  
**Last commit:** `ea573ae` — fix: pin zod to 3.23.8

---

## What was built this session

### Phase 1 (#1) — Complete
Plasmo MV3 scaffold: React 18, Tailwind v3, shadcn New York+Zinc, TypeScript strict, Biome, `@/` alias, simple-git-hooks pre-commit.

### Phase 2 (#2) — Complete
Design-system scaffold:
- `src/style.css` — single source of truth for all design tokens (Zinc palette, font stack, size scale, radius, sidebar/gallery surface tokens, dark mode via `@media`)
- `src/tabs/design-system.tsx` — dev-only Plasmo tab route showcasing all 8 shadcn primitives against live tokens; gated on `process.env.NODE_ENV === 'development'`
- `tailwind.config.ts` — all tokens wired as Tailwind utilities

### Phase 3 (#3–#7) — Complete (parallel worktrees, all merged)

| Issue | File | Tests |
|---|---|---|
| #3 | `src/lib/store.ts` — Dexie v1, SavedSiteStore singleton | 13 ✓ |
| #4 | `src/lib/metadata-extractor.ts` — pure DOM reader | 20 ✓ |
| #5 | `src/lib/categorizer.ts` — OG type + domain heuristics | 45 ✓ |
| #6 | `src/lib/thumbnail-service.ts` — fetch→OffscreenCanvas→WebP@400×300@0.6 | 6 ✓ |
| #7 | `src/lib/messages.ts` — SaveRequest discriminated union + Zod + parseMessage | — |

**Total: 84 tests passing.**

### Phase 4 (#8) — Complete
Tracer bullet end-to-end save:
- `src/contents/fav-button.tsx` — Plasmo content script, fixed bottom-right bookmark button, calls MetadataExtractor + sends SAVE_REQUEST via `chrome.runtime.sendMessage`
- `src/background.ts` — thin SW handler: parseMessage (Zod) → fetchAndResize → categorize → savedSiteStore.add
- `src/tabs/gallery.tsx` — minimal list page (replaced in #10), reads all SavedSites from Dexie, renders thumbnail + title + category badge

---

## Critical bug fixed this session — MUST READ

### Zod + Parcel 2 incompatibility

**Symptom:** `Service worker registration failed. Status code: 15` (`kErrorScriptEvaluateFailed`) + `(0 , _zod.z).literal is not a function`

**Root cause:** Plasmo 0.90.5 uses Parcel 2.9.3 internally. Neither Zod v4.x nor Zod 3.25.x (dual-mode package) can be resolved by this bundler version. Parcel maps `./v4/classic/external.js` and `./v3/external.js` to `false` in the module bundle — making `z` undefined/non-callable at SW evaluation time.

**Fix:** `"zod": "3.23.8"` — **exact pin, no caret** — in `package.json`. This version has a plain `./lib/index.js` CJS entry that Parcel 2 resolves cleanly.

**Do NOT upgrade zod past 3.23.8** until Plasmo is upgraded (which requires React 19 — not in scope for v1).

### Dev build vs prod build

`pnpm run dev` starts Plasmo's watch server and outputs to `build/chrome-mv3-dev/`.  
`pnpm run build` outputs to `build/chrome-mv3-prod/`.

The dev build is NOT automatically regenerated when you change `package.json`. After any dependency change:
1. Kill `pnpm run dev`
2. Restart `pnpm run dev`
3. Reload the extension in `chrome://extensions`

The **prod build** (`build/chrome-mv3-prod/`) is verified working and can be loaded as an unpacked extension for testing without a live dev server.

---

## How to load the extension

```sh
pnpm run dev          # starts watch server → build/chrome-mv3-dev/
# OR
pnpm run build        # one-shot → build/chrome-mv3-prod/
```

1. `chrome://extensions` → Developer Mode ON → Load Unpacked
2. Select `build/chrome-mv3-dev/` (or `chrome-mv3-prod/`)
3. Design system: `chrome-extension://<id>/tabs/design-system.html`
4. Gallery: `chrome-extension://<id>/tabs/gallery.html`

---

## Next work: Phase 5–10

Follow `BUILD_GUIDE.md` exactly. Issues are independent within a phase; run in parallel worktrees where possible (pattern established in Phase 3).

### Issue #9 — Popup + permission flow (Sonnet, HITL)
File: `src/popup.tsx`  
- If broad host permission not granted: show "Grant permission" prompt → `chrome.permissions.request`
- Decline → silent favicon-only fallback, no re-prompt
- "Save this tab" button (mirrors fav-click flow from popup)
- Use shadcn primitives; add any new ones to `src/tabs/design-system.tsx`
- **HITL:** review the decline/favicon-only messaging before merging

### Issue #10 — Virtualized gallery grid (Sonnet, `/frontend-design`)
Replaces `src/tabs/gallery.tsx` with production-quality virtualized grid:
- `@tanstack/react-virtual` or similar — 1000+ items, off-screen memory released
- Clicking tile → `savedSiteStore.incrementOpenCount(id)` → navigate to URL
- Zustand store for gallery UI state (active list, search query, active category)
- Layout: sidebar + card grid matching `ui-refs/` mockups
- Use `/frontend-design` skill

### Issue #11 — Categories (Sonnet)
- Wire `categorize()` into save path in `background.ts`
- CategoryFilter component (Zustand active-category slice)
- Inline category override per tile → `savedSiteStore.update`

### Issue #12 — Search (Haiku)
- Search input → `searchQuery` Zustand slice → `savedSiteStore.search(query)`
- Covers title, URL, category, site name

### Issue #13 — Pin / ranking / resurface (Sonnet)
- Pin/unpin → `setPinned`, float to top
- Sort by `openCount` descending
- Resurface section: sites not recently opened, or same category as recent

### Issue #14 — Polish (Sonnet, HITL)
- New-Tab takeover (opt-in, off by default)
- Empty state, decline state
- Memory stress test: 1000+ items, DevTools Memory tab

---

## Key invariants (never break these)

- **Zod pinned to exactly `3.23.8`** — no caret, no upgrade until Plasmo upgrades
- **No pipeline in background.ts** — no setTimeout, alarms, in-memory queues (ADR 0001)
- **All design tokens in `src/style.css`** — no hardcoded hex/rem/px in components (ADR 0007)
- **Every new shadcn primitive → also added to `src/tabs/design-system.tsx`**
- **Biome linting:** use `./node_modules/.bin/biome` (global binary OOM-crashes)
- **pnpm only** — never npm/yarn
- **`@/` path alias** for all internal imports

---

## Suggested skills for next session

| Skill | When |
|---|---|
| `/frontend-design` | Issue #10 (virtualized gallery grid) |
| `/shadcn` | Any new UI primitive needed |
| `/tdd` | If touching the 4 tested modules (store, metadata-extractor, categorizer, thumbnail-service) |
| `/code-review` | Before merging any PR |

---

## Key file paths

```
src/
  style.css                    ← design tokens (single source of truth)
  background.ts                ← SW handler (thin — ADR 0001)
  contents/fav-button.tsx      ← content script
  tabs/gallery.tsx             ← minimal gallery (replaced in #10)
  tabs/design-system.tsx       ← dev-only showcase
  lib/
    store.ts                   ← SavedSiteStore (Dexie)
    messages.ts                ← Zod message contracts
    metadata-extractor.ts      ← pure DOM reader
    categorizer.ts             ← OG type + domain → Category
    thumbnail-service.ts       ← fetch → WebP blob (400×300 @ 0.6)
  components/ui/               ← shadcn primitives (8 installed)
BUILD_GUIDE.md                 ← full phase/issue build instructions
CLAUDE.md                      ← project rules (read before writing any code)
CONTEXT.md                     ← domain glossary
docs/adr/                      ← architectural decision records
ui-refs/                       ← layout mockups for gallery UI
```
