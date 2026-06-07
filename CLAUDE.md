# URL Gallery — Agent Instructions

Read this before writing any code. These rules encode settled decisions from the design grilling sessions (see docs/adr/ for full rationale).

## Project shape

Browser extension (MV3) built with Plasmo. Favorites-only: a **SavedSite** is created only by an explicit fav-click, never by passive browsing. See CONTEXT.md for the full glossary.

## File layout

```
src/
  background.ts          ← Plasmo service worker (thin: route + write only)
  contents/              ← Plasmo content scripts
    fav-button.tsx       ← injects the fav button; reads metadata as TEXT ONLY
  components/
    ui/                  ← shadcn primitives (never hand-write what shadcn provides)
    [feature]/           ← composed feature components
  lib/
    categorizer.ts       ← pure: (type, siteName, domain) → Category
    metadata-extractor.ts← pure DOM reader; returns text strings only
    thumbnail-service.ts ← SW-side: fetch + createImageBitmap + OffscreenCanvas → WebP
    store.ts             ← Dexie SavedSiteStore
    messages.ts          ← shared message types (discriminated union + Zod schemas)
  hooks/                 ← custom React hooks
  store/                 ← Zustand slices
docs/adr/                ← architectural decision records (read before reversing anything)
CONTEXT.md               ← domain glossary (do not add implementation details here)
```

## Path alias

Always use `@/` for internal imports. `@/` maps to `src/`.

```ts
import { Button } from '@/components/ui/button'   // ✓
import { Button } from '../../components/ui/button' // ✗
```

## TypeScript

`strict: true` + `noImplicitAny: true` + `noUncheckedIndexedAccess: true`. No exceptions. No `any` casts without a comment explaining why.

## Linting + formatting

Biome. Run `npx @biomejs/biome check --write .` before committing. Pre-commit hook (lint-staged + simple-git-hooks) runs this automatically on staged files.

## UI components

Use the `/shadcn` skill to install shadcn/ui primitives into `src/components/ui/`. Never hand-write a component that shadcn already provides.

- Style: **New York**
- Base color: **Zinc**
- Dark mode: `darkMode: 'media'` (follows OS preference; no manual toggle in v1)

## State management

**Zustand** for gallery UI state (active SavedSites, search query, active category). Keep Zustand slices thin — they wrap Dexie queries, not replicate data. Do not use React Context for shared state that the Grid, Search, or CategoryFilter all need.

## Cross-context messages

All messages between the content script and the service worker must:

1. Be defined in `src/lib/messages.ts` as a **discriminated union** (a `type` field is mandatory).
2. Have a corresponding **Zod schema** in the same file.
3. Be **parsed with Zod** in the service worker before acting on them.

Never define a message shape on one side only. Never cast `event.data as SomeType` without parsing.

## The no-pipeline rule (ADR 0001)

The service worker is a thin synchronous handler + storage writer. **No timers, no alarms, no in-memory state, no background queue.** If you find yourself adding a `setTimeout`, `chrome.alarms`, or an in-memory array to the service worker — stop and re-read ADR 0001.

## Image handling rules

- The content script reads **text only**: imageUrl, faviconUrl, title, type. It never touches image bytes.
- The service worker fetches the image and resizes it via `createImageBitmap` + `OffscreenCanvas`. No offscreen document.
- Blobs/ArrayBuffers cannot cross `chrome.runtime.sendMessage` (JSON-only). Never try to pass binary data in a message.

## Testing rules

These four modules must be built test-first with the `/tdd` skill:

| Module | Test approach |
|---|---|
| Categorizer | Table-driven Vitest — (type, siteName, domain) → Category |
| MetadataExtractor | HTML fixture → assert extracted fields |
| ThumbnailService | Mock fetch + canvas → assert WebP output + fallback |
| SavedSiteStore | fake-indexeddb → assert CRUD, search, openCount, pin |

PermissionGate, Grid, Search, and CategoryFilter: verify manually in v1.

## Active skills (when to invoke)

| Skill | When |
|---|---|
| `/shadcn` | Adding any new UI primitive |
| `/tdd` | Building or modifying the four tested modules |
| `/frontend-design` | Building any new page or major UI surface |
| `/code-review` | Before merging any PR |

## Storage rules

- Dexie schema must be versioned from v1: `db.version(1).stores(...)`.
- Add new fields or indexes in a new `db.version(N)` block — never mutate an existing version.
- SavedSite fields: `id, url, title, favicon, thumb, category, savedAt, openCount, pinned`.

## Key ADRs (read before reversing a decision)

- **ADR 0001** — no background processing pipeline (favorites-only, frozen thumbnail)
- **ADR 0002** — Plasmo as the extension framework
- **ADR 0003** — Dexie/IndexedDB for storage (blob + queryable indexes)
- **ADR 0004** — Vitest as the test harness
- **ADR 0005** — shadcn New York + Zinc
- **ADR 0006** — Zod message contracts
