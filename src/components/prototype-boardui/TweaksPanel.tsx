import { ChevronDownIcon, MoonIcon, SlidersHorizontalIcon, SunIcon } from "lucide-react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  type Mode,
  PALETTES,
  PALETTE_LIST,
  RADIUS_MAX,
  RADIUS_MIN,
  RADIUS_PRESETS,
  type ThemeState,
  paletteSwatch,
  radiusTokens,
} from "./theme"

interface TweaksPanelProps {
  theme: ThemeState
  onChange: (patch: Partial<ThemeState>) => void
  className?: string
}

const label = "text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground"

/**
 * Live theme controls. Styled with the same tokens as the design, so it re-themes with it.
 * Parent positions it (fixed bottom-right in GalleryPrototype).
 */
export function TweaksPanel({ theme, onChange, className }: TweaksPanelProps) {
  const [open, setOpen] = useState(true)
  const sliderId = useId()
  const palette = PALETTES[theme.palette]
  const radii = radiusTokens(theme.radiusPx)

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "bg-popover shadow-[var(--shadow-xs)] transition-transform duration-150 ease-out active:scale-[0.98]",
          className
        )}
        onClick={() => setOpen(true)}
        aria-label="Open tweaks panel"
      >
        <SlidersHorizontalIcon />
        Tweaks
      </Button>
    )
  }

  return (
    <section
      aria-label="Theme tweaks"
      className={cn(
        "w-72 rounded-card border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-pop)]",
        className
      )}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          Tweaks
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground transition-transform duration-150 ease-out active:scale-[0.98]"
          onClick={() => setOpen(false)}
          aria-label="Collapse tweaks panel"
        >
          <ChevronDownIcon />
        </Button>
      </header>

      <div className="space-y-4">
        {/* Palette */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={label}>Palette</span>
            <span className="text-xs">{palette.label}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" aria-label="Palette">
            {PALETTE_LIST.map((p) => {
              const sw = paletteSwatch(p.id, theme.mode)
              const selected = p.id === theme.palette
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={p.label}
                  title={p.label}
                  onClick={() => onChange({ palette: p.id })}
                  className={cn(
                    "relative aspect-square rounded-md border border-border outline-none transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.96]",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-popover"
                      : "hover:border-[hsl(var(--border-hover))]"
                  )}
                  style={{
                    background: `linear-gradient(135deg, hsl(${sw.accent}) 0 50%, hsl(${sw.neutral}) 50% 100%)`,
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Mode */}
        <div className="space-y-2">
          <span className={label}>Mode</span>
          <div
            aria-label="Light or dark"
            className="grid grid-cols-2 gap-0.5 rounded-lg bg-[hsl(var(--surface-tertiary))] p-0.5"
          >
            {(["light", "dark"] as Mode[]).map((m) => {
              const selected = theme.mode === m
              const Icon = m === "light" ? SunIcon : MoonIcon
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ mode: m })}
                  className={cn(
                    "flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-medium capitalize outline-none transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-[hsl(var(--surface-inner))] text-foreground shadow-[var(--shadow-2xs)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        {/* Radius */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor={sliderId} className={label}>
              Radius
            </label>
            <span className="font-mono text-xs tabular-nums">{theme.radiusPx}px</span>
          </div>
          <input
            id={sliderId}
            type="range"
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            step={1}
            value={theme.radiusPx}
            onChange={(e) => onChange({ radiusPx: Number(e.target.value) })}
            className="block h-5 w-full cursor-pointer accent-[hsl(var(--primary))]"
          />
          <div className="grid grid-cols-5 gap-1">
            {RADIUS_PRESETS.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                size="sm"
                title={`${r.label} · ${r.px}px`}
                onClick={() => onChange({ radiusPx: r.px })}
                className={cn(
                  "h-7 px-0 text-[0.6875rem] shadow-[var(--shadow-xs)] transition-transform duration-150 ease-out active:scale-[0.98]",
                  theme.radiusPx === r.px &&
                    "border-[hsl(var(--primary))] bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-soft-foreground))] hover:bg-[hsl(var(--accent-soft))]"
                )}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Readout */}
        <pre className="overflow-x-auto rounded-md bg-[hsl(var(--surface-section))] p-2 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground tabular-nums">
          {`palette  ${theme.palette}\nmode     ${theme.mode}\n--radius ${radii.radius}\ncard     ${radii["radius-card"]}`}
        </pre>
      </div>
    </section>
  )
}
