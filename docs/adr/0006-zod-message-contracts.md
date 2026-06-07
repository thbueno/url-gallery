# Typed cross-context messages: discriminated union + Zod boundary parse

**Status:** accepted

The service worker and content script communicate via `chrome.runtime.sendMessage`, which is JSON-only and untyped at runtime. A mismatch between what the content script sends and what the service worker expects causes a silent runtime crash — no TypeScript error, no thrown exception, just wrong behavior.

All message shapes are defined as a TypeScript discriminated union in `src/shared/messages.ts` (a single source of truth for both sides). The service worker parses every incoming message with a Zod schema at the boundary before acting on it. An unrecognized or malformed message throws a caught, logged error rather than silently corrupting state.

Zod was chosen over manual type guards because: it generates the TypeScript type from the schema (no drift between runtime and compile-time shape), and it produces readable error messages when a shape is wrong (useful when agents write new message types independently).

Consequence: `zod` is a runtime dependency. Every new message type must be added to both the union type and the Zod schema in `src/shared/messages.ts` — never defined unilaterally on one side only.
