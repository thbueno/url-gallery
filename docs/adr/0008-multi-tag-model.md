# Replace single Category with multi-Tag model

**Status:** accepted

A SavedSite previously held a single `category: string`. We replaced it with `tags: string[]` because a site can legitimately belong to more than one group (e.g. a GitHub repo is both Dev Tools and Docs). The single-field model forced users into an arbitrary choice and made the override UX frustrating.

The term "Category" is retired; the canonical term is now **Tag**. Tags are still auto-assigned from OG metadata and domain heuristics on save; the user can add, remove, or rename them at any time.

**Filtering semantics: OR.** When multiple tags are selected in the sidebar, the gallery shows sites that have *any* of the selected tags. AND semantics were considered but rejected — OR matches user expectation (same as Gmail labels, Notion tags) and is simpler to implement with Dexie's multi-value index.

**Schema migration:** `SavedSite.category: string` → `tags: string[]`. Dexie `version(2)` migration reads the old `category` field and writes it as a single-element `tags` array, then drops the `category` field. The `category` index is replaced with a `*tags` multi-entry index.

**Taxonomy management** (add/rename/delete tag names) lives in a "Manage tags" sheet in the sidebar footer. Deleting a tag removes it from all sites; sites left with no tags fall back to `["Uncategorized"]`. Per-site tag editing uses a checkbox dropdown on the card.
