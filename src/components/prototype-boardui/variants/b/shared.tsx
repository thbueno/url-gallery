import type { CSSProperties } from "react"
import * as React from "react"

import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { getDomain } from "../../helpers"

/** Radius of content sitting 6px (p-1.5) inside a rounded-card tile. */
export const R_INNER = "rounded-[var(--radius-inner)]"
/** Radius of a row sitting 6px (p-1.5) inside an inner panel: inner - padding, never negative. */
export const R_ROW = "rounded-[max(0px,calc(var(--radius-inner)-6px))]"
/** Radius of a chip sitting 4px (p-1) inside a rounded-lg track. */
export const R_CHIP = "rounded-[max(0px,calc(var(--radius)-4px))]"

export const SECTION = "bg-[hsl(var(--surface-section))]"
export const INNER = "bg-[hsl(var(--surface-inner))]"
export const TERTIARY = "bg-[hsl(var(--surface-tertiary))]"

export function matchesQuery(site: SavedSite, q: string): boolean {
  if (!q) return true
  return (
    site.title.toLowerCase().includes(q) ||
    getDomain(site.url).toLowerCase().includes(q) ||
    site.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`
}

/** Flips to true one frame after mount: lets bars grow from zero with a CSS transition. */
export function useEntered(): boolean {
  const [entered, setEntered] = React.useState(false)
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return entered
}

/** Staggered entrance delay for the nth tile. */
export function stagger(index: number): CSSProperties {
  return { animationDelay: `${Math.min(index, 10) * 45}ms` }
}

export const ENTER =
  "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out fill-mode-backwards motion-reduce:animate-none"

/** Grey section tile. Parents own placement and spacing. */
export function Tile({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-card p-1.5", SECTION, className)} {...props}>
      {children}
    </div>
  )
}

export function TileHeader({
  icon: Icon,
  title,
  aside,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  aside?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-3.5 pt-3 pb-2.5", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium tracking-tight">{title}</h2>
      </div>
      {aside ? <span className="text-xs text-muted-foreground tabular-nums">{aside}</span> : null}
    </div>
  )
}

/** The white panel inside a Tile; rows inside use R_ROW. */
export function InnerPanel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-1.5 shadow-[var(--shadow-card)]", INNER, R_INNER, className)}>
      {children}
    </div>
  )
}
