# URL Gallery — Session Handoff

**Date:** 2026-06-10
**Branch:** `main`
**Last commit:** `3c5fc05` — feat: phase 4 — pinned tag chips (#24) + Framer Motion row animations (#25)
**All tests:** 86 passing

---

## Build status: ALL PHASES COMPLETE (Issues #1–#25)

All planned phases from `docs/build-guide.md` (issues #15–#25) have been implemented and committed. The extension is feature-complete for v2.

---

## What was built this session (v2 phases)

### Phase 1 (Issues #17, #18, #19, #20)
Implemented in a prior session. See commit `1855236`.

### Phase 2 — Data model (Issues #15, #16) — commit `3ba85aa`

- **#15** Dexie v2 schema: `SavedSite.category: string` → `tags: string[]`; `db.version(2)` with `*tags` multi-entry index + upgrade fn migrating category → tags[0]
- **#16** Full logic layer: `categorizer.ts` returns `string[]`, `ALL_TAGS` export; `galleryStore` → `activeTags`, OR filter; `updateSiteTags`; `renameTag` + `deleteTag` on store; tests updated + OR-filter test added (86 total)

### Phase 3 — Tag features (Issues #21, #22, #23) — commit `2d0b37a`

- **#21** `SiteCard`: `DropdownMenuCheckboxItem` multi-select; guard empty → `["Uncategorized"]`; chip shows `tag +N` format
- **#22** `ManageTagsSheet` (new): shadcn `Sheet` panel; add/rename/delete tags; rename cascades to all `savedSites`; delete cascades + fallback to Uncategorized; custom tags persisted in `chrome.storage.local`
- **#23** `tagSettingsStore` (new Zustand slice): `pinnedTags` + `customTags` in `chrome.storage.local`; `CategoryFilter` pin button per tag (hover-visible, always-visible when pinned)

**Bug fix** — commit `df0815d`: sidebar tag filter was multi-selecting (appending). Fixed `CategoryFilter.toggleTag` → single-select: `onSelect(activeTags.includes(name) ? [] : [name])`.

### Phase 4 — Top bar + animations (Issues #24, #25) — commit `3c5fc05`

- **#24** Top bar: search constrained to `w-56`; `flex-1` chip area renders pinned tags as rounded buttons; chip click = single-select toggle (`setActiveTags`)
- **#25** Framer Motion (`framer-motion@12`): virtualizer rows animate in on filter change (opacity 0→1, y 8→0, 180ms, stagger capped at 10×30ms); initial page load skips animation via `hasMounted` ref; `filterVersion` state increments on `activeTags` change; inner `motion.div` key = `filterVersion` keeps virtualizer positioning div key stable

---

## Critical invariants (never break)

- **Zod pinned to exactly `3.23.8`** — Parcel 2 (Plasmo 0.90.5) cannot resolve 3.24+ dual-mode package. See commit `ea573ae`.
- **No pipeline in background.ts** — no setTimeout, alarms, in-memory queues (ADR 0001)
- **All design tokens in `src/style.css`** — no hardcoded hex/rem/px in components (ADR 0007)
- **Every new shadcn primitive → also add to `src/tabs/design-system.tsx`**
- **Biome:** always `./node_modules/.bin/biome` — global binary OOM-crashes on this machine
- **pnpm only** — never npm/yarn
- **`@/` path alias** for all internal imports
- **Dexie schema:** never mutate existing `version(N)` blocks — add new `version(N+1)` only

---

## Key new files (v2 additions)

```
src/
  components/
    gallery/
      ManageTagsSheet.tsx        ← sheet UI for add/rename/delete tags
      CategoryFilter.tsx         ← updated: pinnedTags + pin button per tag; single-select
      SiteCard.tsx               ← updated: multi-select checkbox dropdown for tags
  store/
    tagSettingsStore.ts          ← Zustand: pinnedTags + customTags via chrome.storage.local
    galleryStore.ts              ← updated: activeTags[], OR filter, renameTag, deleteTag
  lib/
    store.ts                     ← Dexie v2: *tags index, renameTag, deleteTag methods
    categorizer.ts               ← returns string[], ALL_TAGS export
  components/ui/
    sheet.tsx                    ← shadcn Sheet (installed this session)
```

---

## How to load the extension

```sh
pnpm run build        # → build/chrome-mv3-prod/
# OR
pnpm run dev          # watch → build/chrome-mv3-dev/
```

1. `chrome://extensions` → Developer Mode ON → Load Unpacked
2. Select `build/chrome-mv3-prod/` (or dev)
3. Click extension icon → opens gallery tab
4. Design system (dev only): `chrome-extension://<id>/tabs/design-system.html`

---

## Installed shadcn primitives (10)

`src/components/ui/`: avatar, badge, button, card, dropdown-menu, input, scroll-area, separator, **sheet** *(new)*, skeleton

---

## Remaining work (post-v2)

No tracked issues remain. Possible next:
- Manual stress test: load extension → "Seed DB" → DevTools → Memory → heap snapshot
- E2E tests (Playwright + chrome-extension loader)
- Options page (custom categories, export all, clear all)
- Design system page: add `ManageTagsSheet`, `CategoryFilter`, pinned chip examples
- Issue #20 (toolbar fav-click / remove fav-button content script) — implemented in phase 1 commit `1855236` but verify the `scripting` + `activeTab` permission flow works correctly in prod

---

## Suggested skills

| Skill | When |
|---|---|
| `/shadcn` | Adding any new UI primitive |
| `/tdd` | Touching the 4 tested modules (`store`, `metadata-extractor`, `categorizer`, `thumbnail-service`) |
| `/frontend-design` | New page or major UI surface |
| `/code-review` | Before any PR or major change |
