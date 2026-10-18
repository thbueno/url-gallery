import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"

import type { SavedSite } from "@/lib/store"

import { PrototypeSwitcher, type SwitcherItem } from "./PrototypeSwitcher"
import { TweaksPanel } from "./TweaksPanel"
import { DEFAULT_THEME, GOOGLE_FONTS_HREF, type ThemeState, applyTheme, clearTheme } from "./theme"
import type { VariantKey, VariantModule, VariantProps } from "./types"
import { useSites } from "./useSites"
import * as VariantA from "./variants/VariantA"
import * as VariantB from "./variants/VariantB"
import * as VariantC from "./variants/VariantC"

const VARIANTS: Record<VariantKey, VariantModule> = { A: VariantA, B: VariantB, C: VariantC }
const KEYS: VariantKey[] = ["A", "B", "C"]
const ITEMS: SwitcherItem[] = KEYS.map((key) => ({ key, name: VARIANTS[key].name }))

function readVariant(): VariantKey {
  const raw = new URLSearchParams(window.location.search).get("variant")?.toUpperCase()
  return KEYS.find((k) => k === raw) ?? "A"
}

function initialTheme(): ThemeState {
  const dark = document.documentElement.classList.contains("dark")
  return { ...DEFAULT_THEME, mode: dark ? "dark" : "light" }
}

/** Dev-only shell: real data -> active variant, plus the switcher and the Tweaks panel. */
export default function GalleryPrototype() {
  const { sites, tags, stats, loading, isDemo } = useSites()
  const [variant, setVariant] = useState<VariantKey>(readVariant)
  const [theme, setTheme] = useState<ThemeState>(initialTheme)
  const [thumbUrls, setThumbUrls] = useState<Map<SavedSite, string>>(new Map())

  // Theme: layout effect so the first paint is already themed.
  useLayoutEffect(() => {
    applyTheme(theme.palette, theme.mode, theme.radiusPx)
  }, [theme])
  useEffect(() => clearTheme, [])

  // Fonts: Inter + JetBrains Mono from Google Fonts.
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = GOOGLE_FONTS_HREF
    document.head.appendChild(link)
    return () => link.remove()
  }, [])

  // Thumbnails: one object URL per blob, revoked on change/unmount.
  useEffect(() => {
    const map = new Map<SavedSite, string>()
    for (const s of sites) if (s.thumb) map.set(s, URL.createObjectURL(s.thumb))
    setThumbUrls(map)
    return () => {
      for (const u of map.values()) URL.revokeObjectURL(u)
    }
  }, [sites])

  const selectVariant = useCallback((key: VariantKey) => {
    setVariant(key)
    const url = new URL(window.location.href)
    url.searchParams.set("variant", key)
    window.history.replaceState(null, "", url)
  }, [])

  const patchTheme = useCallback(
    (patch: Partial<ThemeState>) => setTheme((t) => ({ ...t, ...patch })),
    []
  )

  const props: VariantProps = useMemo(
    () => ({
      sites,
      tags,
      loading,
      isDemo,
      stats,
      openSite: (url) => {
        window.open(url, "_blank", "noopener,noreferrer")
      },
      getThumbUrl: (site) => thumbUrls.get(site),
    }),
    [sites, tags, loading, isDemo, stats, thumbUrls]
  )

  const Active = VARIANTS[variant].default

  return (
    <div className="h-dvh w-full overflow-y-auto bg-background font-sans text-foreground antialiased">
      <Active {...props} />
      {/* Tooling: switcher bottom-centre; Tweaks bottom-right above it in z-order, never overlapping. */}
      <PrototypeSwitcher
        items={ITEMS}
        value={variant}
        onChange={selectVariant}
        className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2"
      />
      <div className="fixed right-4 bottom-4 z-[70] flex max-h-[calc(100dvh-2rem)] flex-col items-end">
        <TweaksPanel theme={theme} onChange={patchTheme} />
      </div>
    </div>
  )
}
