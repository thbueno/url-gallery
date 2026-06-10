# URL Gallery v2 — Build Guide

Step-by-step prompts for implementing issues #15–#25 in order.
Model assignments: **Sonnet** for integration/complex work, **Haiku** for pure/mechanical tasks.

---

## Phase 0 — Before anything

Verify the build still passes before touching anything:

```
! pnpm run build
! pnpm run lint
! pnpm test
```

All three must be green. If not, fix the baseline before starting.

---

## Phase 1 — Independent fixes (Issues #17, #18, #19, #20 — run in parallel)

These four have no blockers. Open separate sessions or branches.

---

### 1a — Fix thumbnail distortion (Issue #17)

**Model: Haiku** *(pure math, one file)*

> Fix aspect ratio distortion in `src/lib/thumbnail-service.ts`.
>
> Currently `ctx.drawImage(bitmap, 0, 0, 400, 300)` stretches any image to fill the canvas regardless of its original dimensions.
>
> Replace the draw call with cover-fit math:
> ```ts
> const scaleX = OUTPUT_WIDTH / bitmap.width
> const scaleY = OUTPUT_HEIGHT / bitmap.height
> const scale = Math.max(scaleX, scaleY)
> const drawW = bitmap.width * scale
> const drawH = bitmap.height * scale
> const offsetX = (OUTPUT_WIDTH - drawW) / 2
> const offsetY = (OUTPUT_HEIGHT - drawH) / 2
> ctx.drawImage(bitmap, offsetX, offsetY, drawW, drawH)
> ```
>
> Output canvas size stays 400×300. Behavior: scale so image fills both axes, then center-crop — identical to CSS `object-fit: cover`.
>
> Update the ThumbnailService Vitest tests to assert a wide image (e.g. 1200×630) does not distort.
>
> This is issue #17.

**Verify:** save a page with a wide OG image and confirm the stored thumbnail fills the card without stretching.

---

### 1b — Fix card dropdown opens site (Issue #18)

**Model: Haiku** *(targeted stopPropagation fix)*

> Fix the bug in `src/components/gallery/SiteCard.tsx` where selecting an item from the tag dropdown navigates to the site.
>
> The card is a `<button>` with an `onClick` that opens the URL. Pointer and click events from the Radix `DropdownMenu` bubble up through the card button and trigger it.
>
> Ensure all pointer/click events originating inside the `DropdownMenu` (trigger, content, items) are fully stopped before reaching the card button. Check: `onPointerDown`, `onPointerUp`, `onPointerDownCapture`, and `onClick` on the trigger and menu content.
>
> Do not use `e.stopPropagation()` on `onSelect` alone — that is a synthetic Radix event and does not stop native pointer propagation on the parent button.
>
> This is issue #18.

**Verify:** open the tag dropdown on a card — selecting any item must not open the site. Normal card click must still open the site.

---

### 1c — Sidebar collapse toggle (Issue #19)

**Model: Haiku** *(focused UI, no new deps)*

> Add a collapse/expand toggle to the gallery sidebar in `src/tabs/gallery.tsx`.
>
> - Toggle button uses Lucide `PanelLeftClose` (when open) and `PanelLeftOpen` (when collapsed)
> - Collapsed: sidebar shrinks to 0 width (or a narrow icon rail — your choice), content hidden
> - Smooth CSS width transition (no layout jump)
> - Collapsed state persisted to `localStorage` key `sidebar-collapsed`
> - When collapsed, the main grid area expands to fill the freed space
> - Toggle button remains accessible in both states
>
> This is issue #19.

**Verify:** collapse sidebar, reload the tab — sidebar stays collapsed. Expand — grid reflows correctly.

---

### 1d — Fav-button removal + toolbar icon (Issue #20)

**Model: Sonnet** *(cross-context wiring, background script changes)*

> Remove the floating in-page fav button and move fav-click to the extension toolbar icon.
>
> 1. Delete `src/contents/fav-button.tsx` entirely.
> 2. In `src/background.ts`, add a `chrome.action.onClicked` listener. It must:
>    - Use `chrome.scripting.executeScript` to inline-extract metadata from the active tab (OG image, favicon, title, og:type) — cannot import modules here, inline the extraction logic
>    - Send the result through the existing `SAVE_REQUEST` handler
> 3. Remove `<all_urls>` from required permissions if it was only needed for the content script. Add `scripting` and `activeTab` to permissions if not already present.
>
> The save flow (thumbnail fetch → categorize → Dexie write) is unchanged. Only the trigger moves.
>
> This is issue #20.

**Verify:** load unpacked extension, click toolbar icon on any page — site saves to gallery. No floating button appears on any page. Check `chrome://extensions` that `<all_urls>` is no longer in required permissions.

---

## Phase 2 — Data model foundation (Issues #15 → #16)

**These must run in order. #16 is blocked by #15.**

---

### 2a — Dexie v2 schema (Issue #15)

**Model: Sonnet** *(schema migration, data safety)*

> Migrate `src/lib/store.ts` from `category: string` to `tags: string[]` at the schema level.
>
> 1. Update the `SavedSite` interface: remove `category: string`, add `tags: string[]`
> 2. Add a `db.version(2)` block:
>    ```ts
>    this.version(2)
>      .stores({
>        savedSites: "++id, url, *tags, pinned, openCount, savedAt",
>      })
>      .upgrade((tx) =>
>        tx.table("savedSites").toCollection().modify((site) => {
>          site.tags = [site.category ?? "Uncategorized"]
>          delete site.category
>        })
>      )
>    ```
> 3. Keep `version(1)` unchanged — never mutate existing versions.
> 4. TypeScript must compile with no errors.
>
> Note: the gallery UI will break after this until #16 is complete. That is expected.
>
> This is issue #15.

**Verify:** load extension after migration — open DevTools → Application → IndexedDB → SavedSiteDatabase. Existing records must have a `tags` array containing the old category value.

---

### 2b — Store/logic layer (Issue #16)

**Model: Sonnet** *(multi-file wiring, OR filter semantics, tests)*

> Wire the full logic layer to use `tags: string[]`. Build on the schema from #15.
>
> **`src/lib/categorizer.ts`:** change return type from `Category` to `string[]`. Auto-categorization now returns an array (e.g. `["Video"]` or `["Uncategorized"]`). Export `ALL_TAGS: string[]` replacing `ALL_CATEGORIES`.
>
> **`src/lib/store.ts`:** update `search(query)` to match if any element of `site.tags` contains the query string.
>
> **`src/store/galleryStore.ts`:**
> - `activeCategory: string | null` → `activeTags: string[]`
> - `setActiveCategory` → `setActiveTags(tags: string[])` — filter uses OR: `site.tags.some(t => activeTags.includes(t))`
> - `updateSiteCategory` → `updateSiteTags(id: number, tags: string[])`
> - `queryCategories` → `queryTags()` — returns `TagCount[]` from the multi-entry index
>
> **Tests:** update all Categorizer and SavedSiteStore Vitest tests to use `tags` arrays. Add a test asserting OR filter: a site with `tags: ["Video", "Dev Tools"]` must appear when filtering by either tag alone.
>
> **Gallery UI:** update `CategoryFilter` component to read `activeTags` and pass `string[]` to `setActiveTags`. Gallery must load and tag filter must work end-to-end.
>
> This is issue #16.

**Verify:** `pnpm test` passes. Click a tag in the sidebar — grid filters correctly. Click two tags — sites with either tag appear.

---

## Phase 3 — Tag features (Issues #21, #22, #23 — parallel after #16)

---

### 3a — Per-site tag checkbox dropdown (Issue #21)

**Model: Haiku** *(component swap, no new logic)*

> Replace the single-select category dropdown on `SiteCard` with a multi-select checkbox dropdown.
>
> In `src/components/gallery/SiteCard.tsx`:
> - `DropdownMenuItem` items become `DropdownMenuCheckboxItem` (or equivalent)
> - Items list all tags from `ALL_TAGS`
> - Checked state: `site.tags.includes(tag)`
> - On check: add tag to site's tags array; on uncheck: remove it
> - Guard: if unchecking would leave `site.tags` empty, set to `["Uncategorized"]` instead
> - Wire to `onTagsChange(site, newTags: string[])` prop (rename from `onCategoryChange`)
>
> Bug fix from #18 must be in place before this — do not regress it.
>
> This is issue #21.

**Verify:** open dropdown on a card with one tag — check a second tag, card shows both. Uncheck the only remaining tag — card shows "Uncategorized".

---

### 3b — Manage Tags sheet (Issue #22)

**Model: Sonnet** *(sheet UI + cascade logic)*

> Add tag taxonomy management. Entry point: a "Manage tags" button at the bottom of the sidebar. Opens a shadcn `Sheet`.
>
> Sheet contents:
> - List of all tags with site count (e.g. "Video · 14")
> - **Rename**: click tag name → inline edit → save → updates every `site.tags` entry that contained the old name
> - **Delete**: delete button → confirmation → removes tag from all sites; sites with no remaining tags get `["Uncategorized"]`
> - **Add**: small form at top or bottom — type a name → creates the tag (appears in list; no sites assigned yet)
>
> All mutations go through `savedSiteStore` + trigger a `useGalleryStore.load()` refresh.
>
> Install shadcn `Sheet` component if not already present via `/shadcn`.
>
> This is issue #22.

**Verify:** rename "Video" → "Movies" — all previously Video cards now show "Movies" in their tag list. Delete "Movies" — those cards fall back to "Uncategorized".

---

### 3c — Pinned tags: storage + sidebar icons (Issue #23)

**Model: Sonnet** *(chrome.storage + Zustand slice)*

> Let users pin tags for quick access. Pinned tag names stored in `chrome.storage.local` as `pinnedTags: string[]`.
>
> 1. Add a `pinnedTags` Zustand slice (in `src/store/`) that:
>    - Hydrates from `chrome.storage.local.get("pinnedTags")` on init
>    - Exposes `togglePinTag(tag: string)` — writes back to `chrome.storage.local` on each change
> 2. In `CategoryFilter` (sidebar), each tag row gets an inline pin icon:
>    - Use `PinIcon` from lucide-react (same as card pin)
>    - Visible on hover; always visible when pinned
>    - Clicking calls `togglePinTag`
>
> Pinning a tag does not change the active tag filter. Purely a display preference.
>
> This is issue #23.

**Verify:** pin "Dev Tools" in the sidebar, reload the tab — it is still pinned. Unpin — icon disappears on non-hover.

---

## Phase 4 — Top bar + animations (Issues #24, #25 — parallel after #23 / #16)

---

### 4a — Top bar: search resize + pinned tag chips (Issue #24)

**Model: Haiku** *(layout + chip rendering)*

> Update the gallery top bar in `src/tabs/gallery.tsx`.
>
> 1. Constrain the search input width — remove `flex-1`, give it a fixed or max-width (e.g. `max-w-xs`) so chips have room
> 2. Render a chip for each pinned tag (from the `pinnedTags` Zustand slice) next to the search input
> 3. Chip behavior: clicking a chip toggles that tag in `activeTags` (calls `setActiveTags`)
> 4. Active chip (tag is in `activeTags`) gets a highlighted style — use `bg-accent text-accent-foreground`
> 5. No chips rendered when `pinnedTags` is empty
>
> This is issue #24.

**Verify:** pin two tags → chips appear in top bar. Collapse sidebar → chips are the only tag navigation visible. Click a chip → grid filters. Click again → filter clears.

---

### 4b — Framer Motion row animations (Issue #25)

**Model: Sonnet** *(virtualizer integration, dep addition)*

> Add fluid enter animations when the tag filter changes.
>
> 1. `pnpm add framer-motion`
> 2. In `src/tabs/gallery.tsx`, wrap the virtualizer row `div` with `motion.div` inside an `AnimatePresence`
> 3. Use a `filterKey` (derived from `activeTags.join(",")`) as part of the row key so `AnimatePresence` detects the filter change
> 4. Animation: `initial={{ opacity: 0, y: 8 }}` → `animate={{ opacity: 1, y: 0 }}`, duration 180ms
> 5. Stagger: `delay: Math.min(virtualRow.index, 10) * 0.03` — cap at 10 rows to avoid late-arriving rows at large counts
> 6. Animation must not play on initial page load — only on filter changes. Use a `useRef` mounted flag to skip the first render.
> 7. Confirm virtualizer `ref={rowVirtualizer.measureElement}` still works on `motion.div`
>
> This is issue #25.

**Verify:** switch tags — rows fade in with stagger. Scroll during animation — no jank. With 1000+ seeded items, performance is acceptable (use dev seed button to verify).

---

## Model assignment summary

| Issue | Title | Model |
|---|---|---|
| #15 | Dexie v2 schema | Sonnet |
| #16 | Store/logic layer | Sonnet |
| #17 | Fix thumbnail distortion | **Haiku** |
| #18 | Fix card dropdown opens site | **Haiku** |
| #19 | Sidebar collapse toggle | **Haiku** |
| #20 | Fav-button removal + toolbar icon | Sonnet |
| #21 | Per-site tag checkbox dropdown | **Haiku** |
| #22 | Manage Tags sheet | Sonnet |
| #23 | Pinned tags storage + sidebar icons | Sonnet |
| #24 | Top bar chips + search resize | **Haiku** |
| #25 | Framer Motion row animations | Sonnet |

---

## Rules to repeat in every session

Paste this at the start of any new Claude session on this project:

> Read CLAUDE.md before writing any code. Use pnpm (not npm). Use `@/` path alias for all internal imports. All design tokens in `src/style.css` only — no hardcoded hex, sizes, or radii in components. Any PR that adds a UI primitive must also update `src/tabs/design-system.tsx`.

---

## Dependency graph

```
#17  fix thumbnail        (start immediately)
#18  fix card dropdown    (start immediately)
#19  sidebar collapse     (start immediately)
#20  toolbar fav-click    (start immediately)

#15  Dexie v2 schema      (start immediately)
└── #16  store/logic layer
        ├── #21  per-site tag checkbox
        ├── #22  manage tags sheet
        ├── #23  pinned tags + sidebar icons
        │       └── #24  top bar chips
        └── #25  framer motion animations
```
