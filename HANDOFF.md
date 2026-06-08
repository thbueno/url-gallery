# URL Gallery — Session Handoff

**Date:** 2026-06-08  
**Branch:** `main`  
**Last commit:** `0510425` — feat: phase 10 polish — icon→gallery, permission banner, dev seed (issue #14)  
**All tests:** 84 passing  

---

## Build status: ALL PHASES COMPLETE (Issues #1–#14)

Every planned phase has been implemented and committed. The extension is feature-complete for v1.

---

## What was built across all sessions

### Phase 1 (#1) — Scaffold
Plasmo MV3, React 18, Tailwind v3, shadcn New York+Zinc, TypeScript strict, Biome, `@/` alias, simple-git-hooks.

### Phase 2 (#2) — Design system
`src/style.css` (single token source), `src/tabs/design-system.tsx` (dev-only), `tailwind.config.ts`.

### Phase 3 (#3–#7) — Core library modules (84 tests)

| Issue | File | Tests |
|---|---|---|
| #3 | `src/lib/store.ts` | 13 ✓ |
| #4 | `src/lib/metadata-extractor.ts` | 20 ✓ |
| #5 | `src/lib/categorizer.ts` | 45 ✓ |
| #6 | `src/lib/thumbnail-service.ts` | 6 ✓ |
| #7 | `src/lib/messages.ts` | — |

### Phase 4 (#8) — Tracer bullet end-to-end save
`src/contents/fav-button.tsx`, `src/background.ts`, minimal gallery.

### Phase 5 (#9) — Popup + permission flow
`src/popup.tsx`: permission request, decline→favicon-only fallback, save-this-tab hero action.  
Decline stored as `permissionDeclined: true` in `chrome.storage.local`.

### Phase 6 (#10) — Virtualized gallery grid
`src/tabs/gallery.tsx` replaced with `@tanstack/react-virtual` row virtualization, `useGalleryStore` Zustand store at `src/store/galleryStore.ts`.

### Phase 7 (#11) — Categories
`src/components/gallery/CategoryFilter.tsx`, per-tile DropdownMenu override, uncategorized notice, `ALL_CATEGORIES` export in categorizer, `dropdown-menu` shadcn primitive installed.

### Phase 8 (#12) — Search
Search input in gallery header wired to `searchQuery` Zustand slice → `savedSiteStore.search()`.

### Phase 9 (#13) — Pin / ranking / resurface
Pin button on SiteCard (top-right, hover-visible), `togglePin` store action, sort by `openCount`, `RevisitStrip` (sites saved 7+ days ago, never opened, max 6).

### Phase 10 (#14) — Polish
Three changes:

1. **Extension icon → gallery tab**  
   - `src/background.ts`: `chrome.action.onClicked` opens `tabs/gallery.html`  
   - `package.json` manifest: `"action": {}` — no popup, icon click fires listener  

2. **Permission-declined banner** in `src/tabs/gallery.tsx`  
   - Shown when `chrome.storage.local.permissionDeclined === true`  
   - "Enable full thumbnails" re-requests `https://*/*`, clears flag on success  
   - X dismisses for the session  

3. **Dev-only seed button** (gated on `NODE_ENV === 'development'`)  
   - Inserts 1000 SavedSites; backdates last 20 to 8 days ago for resurface strip  
   - Use for manual DevTools Memory tab stress test  

---

## Critical invariants (never break)

- **Zod pinned to exactly `3.23.8`** — Parcel 2 (Plasmo 0.90.5) cannot resolve 3.24+ dual-mode package. See commit `ea573ae`.
- **No pipeline in background.ts** — no setTimeout, alarms, in-memory queues (ADR 0001)
- **All design tokens in `src/style.css`** — no hardcoded hex/rem/px in components (ADR 0007)
- **Every new shadcn primitive → also add to `src/tabs/design-system.tsx`**
- **Biome:** always `./node_modules/.bin/biome` — global binary OOM-crashes
- **pnpm only** — never npm/yarn
- **`@/` path alias** for all internal imports

---

## Critical bug (fixed, do not regress)

**Zod + Parcel 2:** `Service worker registration failed. Status code: 15` (`kErrorScriptEvaluateFailed`) + `(0 , _zod.z).literal is not a function`  
**Fix:** `"zod": "3.23.8"` exact pin in `package.json`. See commits `ea573ae`, `8a2b27b`.

---

## How to load the extension

```sh
pnpm run dev          # watch → build/chrome-mv3-dev/
# OR
pnpm run build        # one-shot → build/chrome-mv3-prod/
```

1. `chrome://extensions` → Developer Mode ON → Load Unpacked
2. Select `build/chrome-mv3-dev/` or `build/chrome-mv3-prod/`
3. Click extension icon → opens gallery tab
4. Design system (dev only): `chrome-extension://<id>/tabs/design-system.html`

---

## Installed shadcn primitives (9)

`src/components/ui/`: avatar, badge, button, card, dropdown-menu, input, scroll-area, separator, skeleton

---

## Key file paths

```
src/
  style.css                          ← design tokens (single source of truth)
  background.ts                      ← SW: message handler + action.onClicked → gallery
  contents/fav-button.tsx            ← content script (fav button injection)
  popup.tsx                          ← permission flow + save-this-tab
  tabs/
    gallery.tsx                      ← virtualized grid, search, filter, pin, resurface, banner
    design-system.tsx                ← dev-only token/component showcase
  components/
    ui/                              ← 9 shadcn primitives
    gallery/
      CategoryFilter.tsx
      SiteCard.tsx
  lib/
    store.ts                         ← SavedSiteStore (Dexie)
    messages.ts                      ← Zod message contracts
    metadata-extractor.ts
    categorizer.ts                   ← ALL_CATEGORIES exported
    thumbnail-service.ts
  store/
    galleryStore.ts                  ← Zustand gallery state
docs/adr/                            ← architectural decision records
CLAUDE.md                            ← project rules
CONTEXT.md                           ← domain glossary
BUILD_GUIDE.md                       ← original phase/issue build plan
```

---

## Remaining work (post-v1)

No tracked issues remain. Possible next:
- Manual memory stress test (human): load extension, "Seed DB", DevTools → Memory → heap snapshot
- E2E tests (Playwright + chrome-extension loader)
- Options page (custom categories, clear all, export)
- Design system page: add PermissionBanner + RevisitStrip examples

---

## Suggested skills

| Skill | When |
|---|---|
| `/shadcn` | Adding any new UI primitive |
| `/tdd` | Touching the 4 tested modules |
| `/frontend-design` | New page/surface |
| `/code-review` | Before any PR or major change |
