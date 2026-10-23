import { MoonIcon, SunIcon } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/themeStore"

const segmentClass =
  "h-7 min-w-0 flex-1 gap-1.5 px-0 text-xs text-muted-foreground transition-[background-color,color,box-shadow] duration-fast ease-out hover:bg-transparent hover:text-foreground focus-visible:ring-2 motion-reduce:transition-none data-[state=on]:bg-surface-inner data-[state=on]:text-foreground data-[state=on]:shadow-2xs [&_svg]:size-3.5"

interface ThemeToggleProps {
  className?: string
}

/** Light / Dark segmented control. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <ToggleGroup
      type="single"
      aria-label="Theme"
      value={theme}
      // Clicking the active segment reports "", which must not flip the theme.
      onValueChange={(next) => {
        if (next && next !== theme) toggleTheme()
      }}
      className={cn("gap-0.5 rounded-inner bg-surface-tertiary p-0.5", className)}
    >
      <ToggleGroupItem value="light" className={segmentClass}>
        <SunIcon aria-hidden="true" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" className={segmentClass}>
        <MoonIcon aria-hidden="true" />
        Dark
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
