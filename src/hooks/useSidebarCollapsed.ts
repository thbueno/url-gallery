import { useState } from "react"

/** Sidebar collapsed flag, persisted in localStorage. Defaults to collapsed. */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") !== "false"
    } catch {
      return true
    }
  })

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("sidebar-collapsed", String(next))
      } catch {}
      return next
    })
  }

  return [collapsed, toggle]
}
