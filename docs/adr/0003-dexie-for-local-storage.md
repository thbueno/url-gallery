# Use Dexie (IndexedDB) instead of chrome.storage for SavedSite persistence

**Status:** accepted

`chrome.storage.local` cannot store binary blobs (WebP thumbnails) directly and has a 10 MB quota by default. Storing hundreds of thumbnail blobs requires IndexedDB, which has no fixed quota limit and accepts Blob values natively.

Dexie is a thin Promise-based wrapper over IndexedDB that adds: typed schema with `version().stores()` migrations, compound indexes (needed for category/pinned/openCount queries and full-text search), and a clean async API. The alternative — raw IndexedDB — would replicate most of Dexie's surface area without benefit.

Schema must be versioned from v1 (`db.version(1).stores(...)`) so future field additions or index changes can migrate existing data without data loss.
