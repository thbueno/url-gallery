import { Check, Copy, ExternalLink, MousePointerClick, Pin, Trash2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { Favicon, PrimaryButton, SiteThumb } from "../../atoms"
import { formatDate, getDomain, timeAgo } from "../../helpers"
import { CONTROL_BUTTON } from "./shared"

const PANEL = "overflow-y-auto rounded-card bg-[hsl(var(--surface-section))]"

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-inner)] bg-[hsl(var(--surface-inner))] p-3 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-sm border border-border bg-[hsl(var(--surface-inner))] px-1.5 py-0.5 font-sans text-xs leading-none text-muted-foreground shadow-[var(--shadow-2xs)]">
      {children}
    </kbd>
  )
}

export function InspectorSkeleton({ className }: { className?: string }) {
  return (
    <aside aria-busy="true" className={cn(PANEL, className)}>
      <div className="p-1.5">
        <Skeleton className="aspect-video w-full rounded-[var(--radius-inner)]" />
      </div>
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-20 rounded-[var(--radius-inner)]" />
          <Skeleton className="h-20 rounded-[var(--radius-inner)]" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </aside>
  )
}

export function InspectorEmpty({ className }: { className?: string }) {
  return (
    <aside className={cn(PANEL, "flex items-center justify-center p-6", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <MousePointerClick className="size-5 text-muted-foreground" />
        <p className="text-balance text-sm text-muted-foreground">Select a site to inspect it.</p>
      </div>
    </aside>
  )
}

export interface InspectorProps {
  site: SavedSite
  maxOpens: number
  onOpen: (url: string) => void
  onSelectTag: (tag: string) => void
  className?: string
}

/** Right pane: large thumbnail, identity, stats and (mostly no-op) actions. */
export function Inspector({ site, maxOpens, onOpen, onSelectTag, className }: InspectorProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the "Copied" state when the selection changes
  React.useEffect(() => setCopied(false), [site.id, site.url])
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = () => {
    void navigator.clipboard?.writeText(site.url).then(() => {
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    })
  }

  const pct =
    maxOpens > 0 ? Math.max(site.openCount > 0 ? 4 : 0, (site.openCount / maxOpens) * 100) : 0

  return (
    <aside aria-label="Site details" className={cn(PANEL, className)}>
      <div className="p-1.5">
        <SiteThumb site={site} className="rounded-[var(--radius-inner)]" />
      </div>

      <div className="space-y-5 p-4 pb-20">
        <div className="space-y-1.5">
          <h2 className="text-balance text-lg font-medium leading-snug">{site.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Favicon site={site} size="xs" />
            <span className="min-w-0 break-all" title={site.url}>
              {getDomain(site.url) || site.url}
            </span>
            {site.pinned && (
              <span className="flex shrink-0 items-center gap-1 text-xs">
                <Pin className="size-3" /> Pinned
              </span>
            )}
          </div>
          <p className="line-clamp-2 break-all text-xs text-muted-foreground">{site.url}</p>
        </div>

        {site.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {site.tags.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => onSelectTag(t)}
                title={`Filter by ${t}`}
                className="rounded-sm bg-[hsl(var(--surface-tertiary))] px-2 py-1 text-xs leading-4 text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-[hsl(var(--surface-hover))] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Tile label="Opens">
            <p className="text-xl font-medium tabular-nums leading-none">{site.openCount}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-sm bg-[hsl(var(--surface-tertiary))]">
              <div
                className="h-full rounded-sm bg-primary transition-[width] duration-200 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </Tile>
          <Tile label="Saved">
            <p className="text-xl font-medium tabular-nums leading-none">{timeAgo(site.savedAt)}</p>
            <p className="mt-3 text-xs tabular-nums text-muted-foreground">
              {formatDate(site.savedAt)}
            </p>
          </Tile>
        </div>

        <div className="space-y-2">
          <PrimaryButton className="w-full" onClick={() => onOpen(site.url)}>
            <ExternalLink /> Open site
          </PrimaryButton>
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" className={CONTROL_BUTTON} title="Pin (disabled in prototype)">
              <Pin /> {site.pinned ? "Unpin" : "Pin"}
            </Button>
            <Button size="sm" className={CONTROL_BUTTON} onClick={copy} title="Copy link">
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              size="sm"
              className={cn(CONTROL_BUTTON, "text-destructive hover:text-destructive")}
              title="Delete (disabled in prototype)"
            >
              <Trash2 /> Delete
            </Button>
          </div>
        </div>

        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move <span aria-hidden="true">·</span> <Kbd>↵</Kbd> open{" "}
          <span aria-hidden="true">·</span> <Kbd>/</Kbd> search
        </p>
      </div>
    </aside>
  )
}
