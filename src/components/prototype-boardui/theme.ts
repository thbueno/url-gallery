/**
 * PROTOTYPE (throwaway) — palette presets + runtime theming.
 *
 * `applyTheme()` writes CSS custom properties as inline style on <html>. Inline style wins over
 * `html.dark`, `html.light` and the media query in `src/style.css`, so one call re-themes every
 * component that consumes tokens. State lives in memory only (nothing is persisted).
 *
 * Token format matches `src/style.css`: colour tokens are bare HSL triplets ("216 100% 58%"),
 * consumed as `hsl(var(--x))` or via the Tailwind colour utilities. Shadow / gradient tokens are
 * full CSS values. Palettes were generated from the BoardUI tokens (see prototype-refs/PLAN.md):
 * "board-blue" uses BoardUI's exact values; the others reuse its neutral lightness ramp, gradient
 * structure and shadow set with a different hue.
 *
 * Prototype-only tokens (beyond the shadcn set in style.css):
 *   --surface-section   grey section / card ground (BoardUI "secondary" surface)
 *   --surface-inner     tile sitting on a section (white in light mode)
 *   --surface-tertiary  filled controls, inactive tracks, chips
 *   --surface-hover     hover fill for rows / menu items
 *   --border-hover      control border on hover
 *   --separator         row dividers
 *   --accent-soft / --accent-soft-foreground   tinted accent chip (selected tab count, badge)
 *   --primary-gradient-from / -to / -hover-from / -hover-to   180deg gradient stops
 *   --shadow-primary    primary button shadow (inner highlight + 1px ring)
 *   --shadow-2xs|xs|sm|md|lg|card|dropdown|pop   BoardUI elevation set
 *   --radius-inner      radius for content inset ~6px inside a --radius-card container
 *   --tag-blue|green|purple-bg / -fg   BoardUI status-chip pairs (soft tint + darker text) for tag
 *                       chips; shared by all palettes (see TAG_TOKENS). Dark backgrounds carry alpha.
 */

export type PaletteId = "board-blue" | "graphite" | "sage" | "ember" | "iris"
export type Mode = "light" | "dark"
export type TokenMap = Record<string, string>

export interface Palette {
  id: PaletteId
  label: string
  light: TokenMap
  dark: TokenMap
}

export interface ThemeState {
  palette: PaletteId
  mode: Mode
  radiusPx: number
}

export interface RadiusPreset {
  id: string
  label: string
  px: number
}

export const RADIUS_MIN = 0
export const RADIUS_MAX = 28

/** 10px = BoardUI "radius-2lg" (medium controls); cards derive to 15px (BoardUI uses 16px). */
export const RADIUS_PRESETS: RadiusPreset[] = [
  { id: "sharp", label: "Sharp", px: 0 },
  { id: "crisp", label: "Crisp", px: 4 },
  { id: "boardui", label: "BoardUI", px: 10 },
  { id: "soft", label: "Soft", px: 14 },
  { id: "round", label: "Round", px: 22 },
]

export const DEFAULT_THEME: ThemeState = { palette: "board-blue", mode: "light", radiusPx: 10 }

export const FONT_SANS =
  'Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'
export const FONT_MONO =
  '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace'

export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"

export const PALETTES: Record<PaletteId, Palette> = {
  "board-blue": {
    id: "board-blue",
    label: "Board Blue",
    light: {
      background: "0 0% 100%",
      foreground: "330 0% 3.9388%",
      card: "0 0% 96.8627%",
      "card-foreground": "330 0% 3.9388%",
      popover: "0 0% 100%",
      "popover-foreground": "330 0% 3.9388%",
      primary: "221.2987 97.4684% 53.5294%",
      "primary-foreground": "0 0% 100%",
      secondary: "0 0% 92.1569%",
      "secondary-foreground": "330 0% 3.9388%",
      muted: "0 0% 96.8627%",
      "muted-foreground": "0 0% 45.1519%",
      accent: "0 0% 96.8627%",
      "accent-foreground": "330 0% 3.9388%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "0 0% 92.1569%",
      input: "0 0% 92.1569%",
      ring: "216.2264 100% 58.4314%",
      sidebar: "0 0% 96.8627%",
      "sidebar-foreground": "330 0% 3.9388%",
      "sidebar-primary": "221.2987 97.4684% 53.5294%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "0 0% 100%",
      "sidebar-accent-foreground": "330 0% 3.9388%",
      "sidebar-border": "0 0% 92.1569%",
      "sidebar-ring": "216.2264 100% 58.4314%",
      "thumb-scrim": "linear-gradient(to top, hsl(330 0% 3.9388% / 0.7) 0%, transparent 60%)",
      "card-hover-ring": "60 0% 83.1444%",
      "chart-1": "173.396 100% 41.7625%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "0 0% 96.8627%",
      "surface-inner": "0 0% 100%",
      "surface-tertiary": "0 0% 92.1569%",
      "surface-hover": "0 0% 96.8627%",
      "border-hover": "60 0% 83.1444%",
      separator: "0 0% 92.1569%",
      "accent-soft": "214.2845 96.2218% 92.7756%",
      "accent-soft-foreground": "225.3451 84.0953% 48.9841%",
      "primary-gradient-from": "216.2264 100% 58.4314%",
      "primary-gradient-to": "221.2987 97.4684% 53.5294%",
      "primary-gradient-hover-from": "212.0588 100% 60%",
      "primary-gradient-hover-to": "216.2264 100% 58.4314%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(216.2264 100% 58.4314%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.05)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.04), 0 4px 4px 0 rgb(0 0 0 / 0.02)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.0196), 0 1px 12px 0 rgb(0 0 0 / 0.0588), 0 0 1px 0 rgb(0 0 0 / 0.3216)",
    },
    dark: {
      background: "0 0% 7.0588%",
      foreground: "180 0% 98.0256%",
      card: "0 0% 9.0527%",
      "card-foreground": "180 0% 98.0256%",
      popover: "0 0% 14.9382%",
      "popover-foreground": "180 0% 98.0256%",
      primary: "221.2987 97.4684% 53.5294%",
      "primary-foreground": "0 0% 100%",
      secondary: "0 0% 14.9382%",
      "secondary-foreground": "180 0% 98.0256%",
      muted: "0 0% 14.9382%",
      "muted-foreground": "0 0% 45.1519%",
      accent: "240 0% 21.0035%",
      "accent-foreground": "180 0% 98.0256%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "240 0% 25.0471%",
      input: "240 0% 25.0471%",
      ring: "216.2264 100% 58.4314%",
      sidebar: "0 0% 9.0527%",
      "sidebar-foreground": "180 0% 98.0256%",
      "sidebar-primary": "221.2987 97.4684% 53.5294%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "0 0% 12.584%",
      "sidebar-accent-foreground": "180 0% 98.0256%",
      "sidebar-border": "240 0% 25.0471%",
      "sidebar-ring": "216.2264 100% 58.4314%",
      "thumb-scrim": "linear-gradient(to top, hsl(0 0% 0% / 0.85) 0%, transparent 55%)",
      "card-hover-ring": "0 0% 45.1519%",
      "chart-1": "173.396 100% 41.7625%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "0 0% 9.0527%",
      "surface-inner": "0 0% 12.584%",
      "surface-tertiary": "0 0% 14.9382%",
      "surface-hover": "240 0% 21.0035%",
      "border-hover": "0 0% 45.1519%",
      separator: "0 0% 14.9382%",
      "accent-soft": "226.5065 58.7367% 21.1477%",
      "accent-soft-foreground": "210.6944 100% 77.8296%",
      "primary-gradient-from": "216.2264 100% 58.4314%",
      "primary-gradient-to": "221.2987 97.4684% 53.5294%",
      "primary-gradient-hover-from": "212.0588 100% 60%",
      "primary-gradient-hover-to": "216.2264 100% 58.4314%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(216.2264 100% 58.4314%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.16)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.18)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.12), 0 1px 3px 0 rgb(0 0 0 / 0.16)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.18)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.18)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.14)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.14), 0 4px 4px 0 rgb(0 0 0 / 0.1)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.1), 0 1px 12px 0 rgb(0 0 0 / 0.16), 0 0 1px 0 rgb(0 0 0 / 0.42)",
    },
  },
  graphite: {
    id: "graphite",
    label: "Graphite",
    light: {
      background: "34.0331 79.0665% 99.5074%",
      foreground: "32.7161 24.6155% 3.7279%",
      card: "34.0419 22.3926% 95.852%",
      "card-foreground": "32.7161 24.6155% 3.7279%",
      popover: "34.0331 79.0665% 99.5074%",
      "popover-foreground": "32.7161 24.6155% 3.7279%",
      primary: "31.5175 17.2375% 11.7789%",
      "primary-foreground": "0 0% 100%",
      secondary: "34.0427 8.7955% 89.5731%",
      "secondary-foreground": "32.7161 24.6155% 3.7279%",
      muted: "34.0419 22.3926% 95.852%",
      "muted-foreground": "34.0887 4.1023% 38.4517%",
      accent: "34.0419 22.3926% 95.852%",
      "accent-foreground": "32.7161 24.6155% 3.7279%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "34.0427 8.7955% 89.5731%",
      input: "34.0427 8.7955% 89.5731%",
      ring: "31.3839 9.0816% 23.4788%",
      sidebar: "34.0419 22.3926% 95.852%",
      "sidebar-foreground": "32.7161 24.6155% 3.7279%",
      "sidebar-primary": "31.5175 17.2375% 11.7789%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "34.0331 79.0665% 99.5074%",
      "sidebar-accent-foreground": "32.7161 24.6155% 3.7279%",
      "sidebar-border": "34.0427 8.7955% 89.5731%",
      "sidebar-ring": "31.3839 9.0816% 23.4788%",
      "thumb-scrim":
        "linear-gradient(to top, hsl(32.7161 24.6155% 3.7279% / 0.7) 0%, transparent 60%)",
      "card-hover-ring": "34.0436 5.2917% 82.9175%",
      "chart-1": "31.3839 9.0816% 23.4788%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "34.0419 22.3926% 95.852%",
      "surface-inner": "34.0331 79.0665% 99.5074%",
      "surface-tertiary": "34.0427 8.7955% 89.5731%",
      "surface-hover": "34.0419 22.3926% 95.852%",
      "border-hover": "34.0436 5.2917% 82.9175%",
      separator: "34.0427 8.7955% 89.5731%",
      "accent-soft": "31.2065 6.7951% 92.0459%",
      "accent-soft-foreground": "31.4278 11.658% 17.4942%",
      "primary-gradient-from": "31.3839 9.0816% 23.4788%",
      "primary-gradient-to": "31.5175 17.2375% 11.7789%",
      "primary-gradient-hover-from": "31.3459 7.0326% 31.8521%",
      "primary-gradient-hover-to": "31.3839 9.0816% 23.4788%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(31.3839 9.0816% 23.4788%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.05)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.04), 0 4px 4px 0 rgb(0 0 0 / 0.02)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.0196), 0 1px 12px 0 rgb(0 0 0 / 0.0588), 0 0 1px 0 rgb(0 0 0 / 0.3216)",
    },
    dark: {
      background: "34.1895 15.1325% 6.7828%",
      foreground: "34.0416 42.2236% 97.7918%",
      card: "34.1673 12.038% 8.7716%",
      "card-foreground": "34.0416 42.2236% 97.7918%",
      popover: "34.1283 7.7031% 14.6427%",
      "popover-foreground": "34.0416 42.2236% 97.7918%",
      primary: "31.2291 8.396% 84.1661%",
      "primary-foreground": "31.3839 13.4125% 6.6841%",
      secondary: "34.1283 7.7031% 14.6427%",
      "secondary-foreground": "34.0416 42.2236% 97.7918%",
      muted: "34.1283 7.7031% 14.6427%",
      "muted-foreground": "34.0686 4.7995% 64.0317%",
      accent: "34.1091 5.7183% 20.6963%",
      "accent-foreground": "34.0416 42.2236% 97.7918%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "34.0972 4.9349% 24.732%",
      input: "34.0972 4.9349% 24.732%",
      ring: "31.2144 42.4538% 97.853%",
      sidebar: "34.1673 12.038% 8.7716%",
      "sidebar-foreground": "34.0416 42.2236% 97.7918%",
      "sidebar-primary": "31.2291 8.396% 84.1661%",
      "sidebar-primary-foreground": "31.3839 13.4125% 6.6841%",
      "sidebar-accent": "34.1433 8.9402% 12.2943%",
      "sidebar-accent-foreground": "34.0416 42.2236% 97.7918%",
      "sidebar-border": "34.0972 4.9349% 24.732%",
      "sidebar-ring": "31.2144 42.4538% 97.853%",
      "thumb-scrim": "linear-gradient(to top, hsl(0 0% 0% / 0.85) 0%, transparent 55%)",
      "card-hover-ring": "34.0721 3.0102% 44.808%",
      "chart-1": "31.2144 42.4538% 97.853%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "34.1673 12.038% 8.7716%",
      "surface-inner": "34.1433 8.9402% 12.2943%",
      "surface-tertiary": "34.1283 7.7031% 14.6427%",
      "surface-hover": "34.1091 5.7183% 20.6963%",
      "border-hover": "34.0721 3.0102% 44.808%",
      separator: "34.1283 7.7031% 14.6427%",
      "accent-soft": "31.3025 5.7382% 17.7217%",
      "accent-soft-foreground": "31.2152 13.4353% 93.2769%",
      "primary-gradient-from": "31.2144 42.4538% 97.853%",
      "primary-gradient-to": "31.2291 8.396% 84.1661%",
      "primary-gradient-hover-from": "0 0% 100%",
      "primary-gradient-hover-to": "31.2144 42.4538% 97.853%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(31.2144 42.4538% 97.853%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.16)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.18)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.12), 0 1px 3px 0 rgb(0 0 0 / 0.16)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.18)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.18)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.14)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.14), 0 4px 4px 0 rgb(0 0 0 / 0.1)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.1), 0 1px 12px 0 rgb(0 0 0 / 0.16), 0 0 1px 0 rgb(0 0 0 / 0.42)",
    },
  },
  sage: {
    id: "sage",
    label: "Sage",
    light: {
      background: "128.6156 58.4853% 99.5091%",
      foreground: "129.2898 18.7007% 3.6994%",
      card: "128.691 16.5302% 95.8554%",
      "card-foreground": "129.2898 18.7007% 3.6994%",
      popover: "128.6156 58.4853% 99.5091%",
      "popover-foreground": "129.2898 18.7007% 3.6994%",
      primary: "145.5545 47.4708% 26.4769%",
      "primary-foreground": "0 0% 100%",
      secondary: "128.6977 6.4899% 89.5765%",
      "secondary-foreground": "129.2898 18.7007% 3.6994%",
      muted: "128.691 16.5302% 95.8554%",
      "muted-foreground": "129.0682 3.0369% 38.4517%",
      accent: "128.691 16.5302% 95.8554%",
      "accent-foreground": "129.2898 18.7007% 3.6994%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "128.6977 6.4899% 89.5765%",
      input: "128.6977 6.4899% 89.5765%",
      ring: "142.5289 29.8127% 38.7522%",
      sidebar: "128.691 16.5302% 95.8554%",
      "sidebar-foreground": "129.2898 18.7007% 3.6994%",
      "sidebar-primary": "145.5545 47.4708% 26.4769%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "128.6156 58.4853% 99.5091%",
      "sidebar-accent-foreground": "129.2898 18.7007% 3.6994%",
      "sidebar-border": "128.6977 6.4899% 89.5765%",
      "sidebar-ring": "142.5289 29.8127% 38.7522%",
      "thumb-scrim":
        "linear-gradient(to top, hsl(129.2898 18.7007% 3.6994% / 0.7) 0%, transparent 60%)",
      "card-hover-ring": "128.7057 3.9043% 82.9208%",
      "chart-1": "142.5289 29.8127% 38.7522%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "128.691 16.5302% 95.8554%",
      "surface-inner": "128.6156 58.4853% 99.5091%",
      "surface-tertiary": "128.6977 6.4899% 89.5765%",
      "surface-hover": "128.691 16.5302% 95.8554%",
      "border-hover": "128.7057 3.9043% 82.9208%",
      separator: "128.6977 6.4899% 89.5765%",
      "accent-soft": "137.2183 26.8644% 91.2796%",
      "accent-soft-foreground": "146.9354 57.3774% 21.1269%",
      "primary-gradient-from": "142.5289 29.8127% 38.7522%",
      "primary-gradient-to": "145.5545 47.4708% 26.4769%",
      "primary-gradient-hover-from": "141.7231 25.3366% 45.8167%",
      "primary-gradient-hover-to": "142.2311 28.1418% 41.0958%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(142.5289 29.8127% 38.7522%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.05)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.04), 0 4px 4px 0 rgb(0 0 0 / 0.02)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.0196), 0 1px 12px 0 rgb(0 0 0 / 0.0588), 0 0 1px 0 rgb(0 0 0 / 0.3216)",
    },
    dark: {
      background: "129.7726 11.2939% 6.7759%",
      foreground: "128.6891 31.1924% 97.7954%",
      card: "129.6278 8.9678% 8.7659%",
      "card-foreground": "128.6891 31.1924% 97.7954%",
      popover: "129.3603 5.7204% 14.6396%",
      "popover-foreground": "128.6891 31.1924% 97.7954%",
      primary: "145.5545 47.4708% 26.4769%",
      "primary-foreground": "0 0% 100%",
      secondary: "129.3603 5.7204% 14.6396%",
      "secondary-foreground": "128.6891 31.1924% 97.7954%",
      muted: "129.3603 5.7204% 14.6396%",
      "muted-foreground": "128.9106 3.5478% 64.0344%",
      accent: "129.2196 4.24% 20.6945%",
      "accent-foreground": "128.6891 31.1924% 97.7954%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "129.1327 3.6557% 24.7312%",
      input: "129.1327 3.6557% 24.7312%",
      ring: "142.5289 29.8127% 38.7522%",
      sidebar: "129.6278 8.9678% 8.7659%",
      "sidebar-foreground": "128.6891 31.1924% 97.7954%",
      "sidebar-primary": "145.5545 47.4708% 26.4769%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "129.4633 6.6469% 12.2901%",
      "sidebar-accent-foreground": "128.6891 31.1924% 97.7954%",
      "sidebar-border": "129.1327 3.6557% 24.7312%",
      "sidebar-ring": "142.5289 29.8127% 38.7522%",
      "thumb-scrim": "linear-gradient(to top, hsl(0 0% 0% / 0.85) 0%, transparent 55%)",
      "card-hover-ring": "128.9386 2.2255% 44.8098%",
      "chart-1": "142.5289 29.8127% 38.7522%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "129.6278 8.9678% 8.7659%",
      "surface-inner": "129.4633 6.6469% 12.2901%",
      "surface-tertiary": "129.3603 5.7204% 14.6396%",
      "surface-hover": "129.2196 4.24% 20.6945%",
      "border-hover": "128.9386 2.2255% 44.8098%",
      separator: "129.3603 5.7204% 14.6396%",
      "accent-soft": "141.6525 30.613% 14.7906%",
      "accent-soft-foreground": "139.7799 44.1231% 74.4147%",
      "primary-gradient-from": "142.5289 29.8127% 38.7522%",
      "primary-gradient-to": "145.5545 47.4708% 26.4769%",
      "primary-gradient-hover-from": "141.7231 25.3366% 45.8167%",
      "primary-gradient-hover-to": "142.2311 28.1418% 41.0958%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(142.5289 29.8127% 38.7522%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.16)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.18)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.12), 0 1px 3px 0 rgb(0 0 0 / 0.16)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.18)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.18)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.14)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.14), 0 4px 4px 0 rgb(0 0 0 / 0.1)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.1), 0 1px 12px 0 rgb(0 0 0 / 0.16), 0 0 1px 0 rgb(0 0 0 / 0.42)",
    },
  },
  ember: {
    id: "ember",
    label: "Ember",
    light: {
      background: "29.6441 100% 99.487%",
      foreground: "24.2203 35.0814% 3.8612%",
      card: "25.8965 34.8346% 95.9796%",
      "card-foreground": "24.2203 35.0814% 3.8612%",
      popover: "29.6441 100% 99.487%",
      "popover-foreground": "24.2203 35.0814% 3.8612%",
      primary: "25.0839 100% 29.0376%",
      "primary-foreground": "0 0% 100%",
      secondary: "25.8988 13.4225% 89.6989%",
      "secondary-foreground": "24.2203 35.0814% 3.8612%",
      muted: "25.8965 34.8346% 95.9796%",
      "muted-foreground": "26.0244 6.127% 38.6502%",
      accent: "25.8965 34.8346% 95.9796%",
      "accent-foreground": "24.2203 35.0814% 3.8612%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "25.8988 13.4225% 89.6989%",
      input: "25.8988 13.4225% 89.6989%",
      ring: "31.1847 100% 34.3232%",
      sidebar: "25.8965 34.8346% 95.9796%",
      "sidebar-foreground": "24.2203 35.0814% 3.8612%",
      "sidebar-primary": "25.0839 100% 29.0376%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "29.6441 100% 99.487%",
      "sidebar-accent-foreground": "24.2203 35.0814% 3.8612%",
      "sidebar-border": "25.8988 13.4225% 89.6989%",
      "sidebar-ring": "31.1847 100% 34.3232%",
      "thumb-scrim":
        "linear-gradient(to top, hsl(24.2203 35.0814% 3.8612% / 0.7) 0%, transparent 60%)",
      "card-hover-ring": "25.9016 8.0354% 83.0413%",
      "chart-1": "31.1847 100% 34.3232%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "25.8965 34.8346% 95.9796%",
      "surface-inner": "29.6441 100% 99.487%",
      "surface-tertiary": "25.8988 13.4225% 89.6989%",
      "surface-hover": "25.8965 34.8346% 95.9796%",
      "border-hover": "25.9016 8.0354% 83.0413%",
      separator: "25.8988 13.4225% 89.6989%",
      "accent-soft": "25.027 77.9782% 91.6993%",
      "accent-soft-foreground": "22.7371 100% 25.4244%",
      "primary-gradient-from": "31.1847 100% 34.3232%",
      "primary-gradient-to": "25.0839 100% 29.0376%",
      "primary-gradient-hover-from": "29.7721 77.5668% 43.0557%",
      "primary-gradient-hover-to": "32.0415 100% 35.6184%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(31.1847 100% 34.3232%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.05)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.04), 0 4px 4px 0 rgb(0 0 0 / 0.02)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.0196), 0 1px 12px 0 rgb(0 0 0 / 0.0588), 0 0 1px 0 rgb(0 0 0 / 0.3216)",
    },
    dark: {
      background: "26.2589 22.2275% 6.8918%",
      foreground: "25.8958 67.5872% 97.92%",
      card: "26.2103 17.7491% 8.8878%",
      "card-foreground": "25.8958 67.5872% 97.92%",
      popover: "26.1214 11.4292% 14.7752%",
      "popover-foreground": "25.8958 67.5872% 97.92%",
      primary: "25.0839 100% 29.0376%",
      "primary-foreground": "0 0% 100%",
      secondary: "26.1214 11.4292% 14.7752%",
      "secondary-foreground": "25.8958 67.5872% 97.92%",
      muted: "26.1214 11.4292% 14.7752%",
      "muted-foreground": "25.9716 7.2632% 64.257%",
      accent: "26.0746 8.5131% 20.84%",
      "accent-foreground": "25.8958 67.5872% 97.92%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "26.0459 7.3588% 24.8832%",
      input: "26.0459 7.3588% 24.8832%",
      ring: "31.1847 100% 34.3232%",
      sidebar: "26.2103 17.7491% 8.8878%",
      "sidebar-foreground": "25.8958 67.5872% 97.92%",
      "sidebar-primary": "25.0839 100% 29.0376%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "26.1555 13.2382% 12.4202%",
      "sidebar-accent-foreground": "25.8958 67.5872% 97.92%",
      "sidebar-border": "26.0459 7.3588% 24.8832%",
      "sidebar-ring": "31.1847 100% 34.3232%",
      "thumb-scrim": "linear-gradient(to top, hsl(0 0% 0% / 0.85) 0%, transparent 55%)",
      "card-hover-ring": "25.981 4.5077% 44.983%",
      "chart-1": "31.1847 100% 34.3232%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "26.2103 17.7491% 8.8878%",
      "surface-inner": "26.1555 13.2382% 12.4202%",
      "surface-tertiary": "26.1214 11.4292% 14.7752%",
      "surface-hover": "26.0746 8.5131% 20.84%",
      "border-hover": "25.981 4.5077% 44.983%",
      separator: "26.1214 11.4292% 14.7752%",
      "accent-soft": "21.3091 61.4964% 16.9157%",
      "accent-soft-foreground": "24.6757 100% 77.8858%",
      "primary-gradient-from": "31.1847 100% 34.3232%",
      "primary-gradient-to": "25.0839 100% 29.0376%",
      "primary-gradient-hover-from": "29.7721 77.5668% 43.0557%",
      "primary-gradient-hover-to": "32.0415 100% 35.6184%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(31.1847 100% 34.3232%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.16)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.18)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.12), 0 1px 3px 0 rgb(0 0 0 / 0.16)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.18)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.18)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.14)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.14), 0 4px 4px 0 rgb(0 0 0 / 0.1)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.1), 0 1px 12px 0 rgb(0 0 0 / 0.16), 0 0 1px 0 rgb(0 0 0 / 0.42)",
    },
  },
  iris: {
    id: "iris",
    label: "Iris",
    light: {
      background: "221.7811 100% 99.7002%",
      foreground: "229.2341 23.8482% 4.5463%",
      card: "228.0361 32.6302% 96.6815%",
      "card-foreground": "229.2341 23.8482% 4.5463%",
      popover: "221.7811 100% 99.7002%",
      "popover-foreground": "229.2341 23.8482% 4.5463%",
      primary: "250.2674 72.9104% 53.5947%",
      "primary-foreground": "0 0% 100%",
      secondary: "228.0396 11.1255% 90.392%",
      "secondary-foreground": "229.2341 23.8482% 4.5463%",
      muted: "228.0361 32.6302% 96.6815%",
      "muted-foreground": "228.2403 4.5654% 39.8571%",
      accent: "228.0361 32.6302% 96.6815%",
      "accent-foreground": "229.2341 23.8482% 4.5463%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "228.0396 11.1255% 90.392%",
      input: "228.0396 11.1255% 90.392%",
      ring: "245.4134 89.0101% 64.6015%",
      sidebar: "228.0361 32.6302% 96.6815%",
      "sidebar-foreground": "229.2341 23.8482% 4.5463%",
      "sidebar-primary": "250.2674 72.9104% 53.5947%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "221.7811 100% 99.7002%",
      "sidebar-accent-foreground": "229.2341 23.8482% 4.5463%",
      "sidebar-border": "228.0396 11.1255% 90.392%",
      "sidebar-ring": "245.4134 89.0101% 64.6015%",
      "thumb-scrim":
        "linear-gradient(to top, hsl(229.2341 23.8482% 4.5463% / 0.7) 0%, transparent 60%)",
      "card-hover-ring": "228.0438 6.4722% 83.7247%",
      "chart-1": "245.4134 89.0101% 64.6015%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "228.0361 32.6302% 96.6815%",
      "surface-inner": "221.7811 100% 99.7002%",
      "surface-tertiary": "228.0396 11.1255% 90.392%",
      "surface-hover": "228.0361 32.6302% 96.6815%",
      "border-hover": "228.0438 6.4722% 83.7247%",
      separator: "228.0396 11.1255% 90.392%",
      "accent-soft": "230.7215 100% 94.793%",
      "accent-soft-foreground": "255.606 82.9088% 40.5489%",
      "primary-gradient-from": "245.4134 89.0101% 64.6015%",
      "primary-gradient-to": "250.2674 72.9104% 53.5947%",
      "primary-gradient-hover-from": "243.8851 100% 70.5369%",
      "primary-gradient-hover-to": "244.7556 96.6225% 67.3368%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(245.4134 89.0101% 64.6015%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.05)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.05)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.04), 0 4px 4px 0 rgb(0 0 0 / 0.02)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.0196), 0 1px 12px 0 rgb(0 0 0 / 0.0588), 0 0 1px 0 rgb(0 0 0 / 0.3216)",
    },
    dark: {
      background: "228.646 15.1105% 7.6958%",
      foreground: "228.0351 79.0255% 98.6245%",
      card: "228.5608 12.3633% 9.7109%",
      "card-foreground": "228.0351 79.0255% 98.6245%",
      popover: "228.4056 8.2522% 15.6466%",
      "popover-foreground": "228.0351 79.0255% 98.6245%",
      primary: "250.2674 72.9104% 53.5947%",
      "primary-foreground": "0 0% 100%",
      secondary: "228.4056 8.2522% 15.6466%",
      "secondary-foreground": "228.0351 79.0255% 98.6245%",
      muted: "228.4056 8.2522% 15.6466%",
      "muted-foreground": "228.1535 5.8091% 65.571%",
      accent: "228.3254 6.2518% 21.7501%",
      "accent-foreground": "228.0351 79.0255% 98.6245%",
      destructive: "357.2057 100% 45.3229%",
      "destructive-foreground": "0 0% 100%",
      border: "228.2763 5.4436% 25.8191%",
      input: "228.2763 5.4436% 25.8191%",
      ring: "245.4134 89.0101% 64.6015%",
      sidebar: "228.5608 12.3633% 9.7109%",
      "sidebar-foreground": "228.0351 79.0255% 98.6245%",
      "sidebar-primary": "250.2674 72.9104% 53.5947%",
      "sidebar-primary-foreground": "0 0% 100%",
      "sidebar-accent": "228.465 9.4554% 13.2723%",
      "sidebar-accent-foreground": "228.0351 79.0255% 98.6245%",
      "sidebar-border": "228.2763 5.4436% 25.8191%",
      "sidebar-ring": "245.4134 89.0101% 64.6015%",
      "thumb-scrim": "linear-gradient(to top, hsl(0 0% 0% / 0.85) 0%, transparent 55%)",
      "card-hover-ring": "228.1689 3.3936% 46.0106%",
      "chart-1": "245.4134 89.0101% 64.6015%",
      "chart-2": "79.9115 100% 45.0836%",
      "chart-3": "327.4692 95.3753% 68.8825%",
      "chart-4": "195.8153 100% 50%",
      "chart-5": "272.2685 100% 73.99%",
      "surface-section": "228.5608 12.3633% 9.7109%",
      "surface-inner": "228.465 9.4554% 13.2723%",
      "surface-tertiary": "228.4056 8.2522% 15.6466%",
      "surface-hover": "228.3254 6.2518% 21.7501%",
      "border-hover": "228.1689 3.3936% 46.0106%",
      separator: "228.4056 8.2522% 15.6466%",
      "accent-soft": "242.4891 46.2336% 24.3974%",
      "accent-soft-foreground": "233.9078 100% 87.966%",
      "primary-gradient-from": "245.4134 89.0101% 64.6015%",
      "primary-gradient-to": "250.2674 72.9104% 53.5947%",
      "primary-gradient-hover-from": "243.8851 100% 70.5369%",
      "primary-gradient-hover-to": "244.7556 96.6225% 67.3368%",
      "shadow-primary":
        "inset 0 1px 0 0 rgb(255 255 255 / 0.25), 0 0 0 1px hsl(245.4134 89.0101% 64.6015%), 0 1px 2px 0 rgb(0 0 0 / 0.1)",
      "shadow-2xs": "0 1px rgb(0 0 0 / 0.16)",
      "shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.18)",
      "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.12), 0 1px 3px 0 rgb(0 0 0 / 0.16)",
      "shadow-md": "0 2px 4px -1px rgb(0 0 0 / 0.12), 0 4px 6px -1px rgb(0 0 0 / 0.18)",
      "shadow-lg": "0 4px 6px -2px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.18)",
      "shadow-card": "0 1px 1px 0 rgb(0 0 0 / 0.14)",
      "shadow-dropdown": "0 1px 1px 0 rgb(0 0 0 / 0.14), 0 4px 4px 0 rgb(0 0 0 / 0.1)",
      "shadow-pop":
        "0 1px 0 0 rgb(0 0 0 / 0.1), 0 1px 12px 0 rgb(0 0 0 / 0.16), 0 0 1px 0 rgb(0 0 0 / 0.42)",
    },
  },
}

/**
 * Tag chip colours: BoardUI `status-blue`, `status-lime` (the "green") and `status-purple` pairs,
 * converted to HSL triplets. Shared across all five palettes (tags are content colour, not chrome),
 * but kept per mode. Dark backgrounds use the BoardUI translucent fills ("h s% l% / a").
 */
export const TAG_HUES = ["blue", "green", "purple"] as const
export type TagHue = (typeof TAG_HUES)[number]

export const TAG_TOKENS: Record<Mode, TokenMap> = {
  light: {
    "tag-blue-bg": "213.3 100% 87.3%",
    "tag-blue-fg": "227.1 75.7% 41.1%",
    "tag-green-bg": "80.7 89.7% 78.9%",
    "tag-green-fg": "83.3 100% 19.4%",
    "tag-purple-bg": "268.7 100% 95.5%",
    "tag-purple-fg": "274.9 96.1% 52.2%",
  },
  dark: {
    "tag-blue-bg": "226.9 59.3% 21.2% / 0.6",
    "tag-blue-fg": "210.7 100% 77.8%",
    "tag-green-bg": "89.3 87.8% 9.6% / 0.6",
    "tag-green-fg": "83.9 100% 40.5%",
    "tag-purple-bg": "274.4 72.7% 31.6% / 0.5",
    "tag-purple-fg": "271.1 100% 84.9%",
  },
}

export const PALETTE_LIST: Palette[] = Object.values(PALETTES)

/** Derives every radius token from one base value (px). Ratios: sm .6, lg 1.35, xl 1.75, card 1.5. */
export function radiusTokens(px: number): TokenMap {
  const r = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, px))
  const f = (n: number) => `${Math.round(n * 100) / 100}px`
  return {
    radius: f(r),
    "radius-sm": f(r * 0.6),
    "radius-lg": f(r * 1.35),
    "radius-xl": f(r * 1.75),
    "radius-card": f(r * 1.5),
    "radius-inner": f(Math.max(0, r * 1.5 - 6)),
  }
}

let appliedKeys: string[] = []

/** Writes the palette + radius + fonts as inline custom properties on <html>. Idempotent. */
export function applyTheme(paletteId: PaletteId, mode: Mode, radiusPx: number): void {
  const root = document.documentElement
  const tokens: TokenMap = {
    ...PALETTES[paletteId][mode],
    ...TAG_TOKENS[mode],
    ...radiusTokens(radiusPx),
    "font-sans": FONT_SANS,
    "font-display": FONT_SANS,
    "font-mono": FONT_MONO,
  }
  for (const key of appliedKeys) {
    if (!(key in tokens)) root.style.removeProperty(`--${key}`)
  }
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${key}`, value)
  }
  appliedKeys = Object.keys(tokens)
  root.classList.toggle("dark", mode === "dark")
  root.classList.toggle("light", mode === "light")
  root.style.colorScheme = mode
}

/** Removes everything applyTheme wrote (the dark/light class is left as-is). */
export function clearTheme(): void {
  const root = document.documentElement
  for (const key of appliedKeys) root.style.removeProperty(`--${key}`)
  root.style.removeProperty("color-scheme")
  appliedKeys = []
}

/** Reads the swatch colours (HSL triplets) for a palette in a mode. */
export function paletteSwatch(
  paletteId: PaletteId,
  mode: Mode
): { accent: string; neutral: string; background: string } {
  const t = PALETTES[paletteId][mode]
  return {
    accent: t["primary-gradient-from"] ?? "0 0% 50%",
    neutral: t["surface-tertiary"] ?? "0 0% 90%",
    background: t.background ?? "0 0% 100%",
  }
}
