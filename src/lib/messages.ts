import { z } from "zod"

// ── Zod schemas ────────────────────────────────────────────────────────────────

export const SaveRequestSchema = z.object({
  type: z.literal("SAVE_REQUEST"),
  url: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  declaredType: z.string().optional(),
})

export const SiteSavedSchema = z.object({
  type: z.literal("SITE_SAVED"),
})

// ── TypeScript types (inferred from schemas) ───────────────────────────────────

export type SaveRequest = z.infer<typeof SaveRequestSchema>
export type SiteSaved = z.infer<typeof SiteSavedSchema>

// ── Union ──────────────────────────────────────────────────────────────────────

export const MessageSchema = z.discriminatedUnion("type", [
  SaveRequestSchema,
  SiteSavedSchema,
  // Add future messages here
])

export type Message = z.infer<typeof MessageSchema>

// ── Parser (service worker calls this before acting on any message) ────────────

export function parseMessage(raw: unknown): Message {
  return MessageSchema.parse(raw)
}

// ── Type-level correctness test ────────────────────────────────────────────────

// Compile-time: ensure SaveRequest with optional fields compiles correctly
const _typeCheckSaveRequest = {
  type: "SAVE_REQUEST",
  url: "https://example.com",
  title: "Example",
} satisfies SaveRequest

// Compile-time: ensure full SaveRequest with all fields compiles correctly
const _typeCheckSaveRequestFull = {
  type: "SAVE_REQUEST",
  url: "https://example.com",
  title: "Example",
  imageUrl: "https://example.com/image.png",
  faviconUrl: "https://example.com/favicon.ico",
  declaredType: "article",
} satisfies SaveRequest

// Compile-time: ensure Message union type works correctly
const _typeCheckMessage: Message = {
  type: "SAVE_REQUEST",
  url: "https://example.com",
  title: "Example",
}
