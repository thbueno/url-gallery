import { z } from "zod"

// ── Schema ─────────────────────────────────────────────────────────────────────

const BackupSiteV1Schema = z.object({
  url: z.string().url(),
  title: z.string(),
  favicon: z.string().nullable(),
  tags: z.array(z.string()),
  savedAt: z.number(),
  openCount: z.number(),
  pinned: z.boolean(),
})

export const BackupSiteSchema = BackupSiteV1Schema.extend({
  /** WebP thumbnail as a data URL, or null when the site has none. */
  thumb: z.string().nullable(),
})

export type BackupSite = z.infer<typeof BackupSiteSchema>

export const TagSettingsSchema = z.object({
  pinnedTags: z.array(z.string()),
  customTags: z.array(z.string()),
  tagOrder: z.array(z.string()),
})

export type TagSettings = z.infer<typeof TagSettingsSchema>

export const BACKUP_FORMAT = "url-gallery-backup"
export const BACKUP_VERSION = 2

const BackupFileV1Schema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(1),
  exportedAt: z.number(),
  sites: z.array(BackupSiteV1Schema),
})

export const BackupFileSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.number(),
  sites: z.array(BackupSiteSchema),
  tagSettings: TagSettingsSchema,
})

// ── Public API ─────────────────────────────────────────────────────────────────

export function exportBackup(sites: BackupSite[], tagSettings: TagSettings): string {
  return JSON.stringify(
    { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: Date.now(), sites, tagSettings },
    null,
    2
  )
}

export interface ParsedBackup {
  sites: BackupSite[]
  /** null for v1 files, which never carried tag settings. */
  tagSettings: TagSettings | null
}

export function parseBackup(text: string): ParsedBackup {
  const raw: unknown = JSON.parse(text)
  const v1 = BackupFileV1Schema.safeParse(raw)
  if (v1.success) {
    return { sites: v1.data.sites.map((s) => ({ ...s, thumb: null })), tagSettings: null }
  }
  const { sites, tagSettings } = BackupFileSchema.parse(raw)
  return { sites, tagSettings }
}

export function toAIDigest(
  sites: Pick<BackupSite, "title" | "url" | "tags" | "savedAt">[]
): string {
  const ordered = [...sites].sort((a, b) => b.savedAt - a.savedAt)
  const header = `# URL Gallery — ${sites.length} saved sites, exported ${new Date().toISOString().slice(0, 10)}`
  const lines = ordered.map((s) => `- [${s.title}](${s.url}) — ${s.tags.join(", ")}`)
  return [header, ...lines].join("\n")
}
