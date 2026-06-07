# Use Vitest as the test harness

**Status:** accepted

Greenfield repo; this ADR sets the testing convention for all future work.

Vitest is chosen over Jest because: it shares Vite's config (Plasmo uses Vite under the hood), TypeScript and ESM work without additional transforms, and `fake-indexeddb` (needed for SavedSiteStore tests) integrates cleanly. The four modules requiring tests (Categorizer, MetadataExtractor, ThumbnailService, SavedSiteStore) are all pure or mockable with no browser-runtime dependencies that would require a real browser runner.

If browser-runtime behaviour ever needs testing (e.g. actual `chrome.*` API calls), add Playwright or a web-ext test runner as a separate suite — do not replace Vitest.
