import { create } from "zustand"

type Theme = "light" | "dark"

const STORAGE_KEY = "url-gallery-theme"

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === "light" || stored === "dark" ? stored : null
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.classList.toggle("light", theme === "light")
}

// Applied at module scope (import time) rather than in an effect, so the
// class lands before first paint instead of causing a wrong-theme flash.
const initialTheme = getStoredTheme() ?? getSystemTheme()
applyTheme(initialTheme)

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark"
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    set({ theme: next })
  },
}))
