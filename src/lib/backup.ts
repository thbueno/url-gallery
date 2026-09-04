import { z } from "zod"

// ── Schema ─────────────────────────────────────────────────────────────────────

export const BackupSiteSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  favicon: z.string().nullable(),
  tags: z.array(z.string()),
  savedAt: z.number(),
  openCount: z.number(),
  pinned: z.boolean(),
})

export type BackupSite = z.infer<typeof BackupSiteSchema>

export const BACKUP_FORMAT = "url-gallery-backup"
export const BACKUP_VERSION = 1

export const BackupFileSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.number(),
  sites: z.array(BackupSiteSchema),
})

// ── Public API ─────────────────────────────────────────────────────────────────

export function exportBackup(sites: BackupSite[]): string {
  return JSON.stringify(
    { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: Date.now(), sites },
    null,
    2
  )
}

export function parseBackup(text: string): BackupSite[] {
  return BackupFileSchema.parse(JSON.parse(text)).sites
}

export function toAIDigest(sites: BackupSite[]): string {
  const ordered = [...sites].sort((a, b) => b.savedAt - a.savedAt)
  const header = `# URL Gallery — ${sites.length} saved sites, exported ${new Date().toISOString().slice(0, 10)}`
  const lines = ordered.map((s) => `- [${s.title}](${s.url}) — ${s.tags.join(", ")}`)
  return [header, ...lines].join("\n")
}
