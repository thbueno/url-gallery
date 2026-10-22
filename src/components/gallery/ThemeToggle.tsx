import { cva } from "class-variance-authority"
import { MoonIcon, SunIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/themeStore"

const segmentVariants = cva(
  "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium outline-none transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
  {
    variants: {
      active: {
        true: "bg-surface-inner text-foreground shadow-2xs",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  }
)

interface ThemeToggleProps {
  className?: string
}

/** Light / Dark segmented control. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  function choose(next: "light" | "dark") {
    if (next !== theme) toggleTheme()
  }

  return (
    <div className={cn("flex gap-0.5 rounded-inner bg-surface-tertiary p-0.5", className)}>
      <button
        type="button"
        onClick={() => choose("light")}
        aria-pressed={theme === "light"}
        className={segmentVariants({ active: theme === "light" })}
      >
        <SunIcon className="size-3.5" aria-hidden="true" />
        Light
      </button>
      <button
        type="button"
        onClick={() => choose("dark")}
        aria-pressed={theme === "dark"}
        className={segmentVariants({ active: theme === "dark" })}
      >
        <MoonIcon className="size-3.5" aria-hidden="true" />
        Dark
      </button>
    </div>
  )
}
