import { BookmarkIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SidebarShellProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  /** Main body, shown only while expanded (e.g. the tag list). */
  children?: React.ReactNode
  /** Pinned to the bottom, shown only while expanded. */
  footer?: React.ReactNode
  className?: string
}

export function SidebarShell({
  collapsed,
  onToggleCollapsed,
  children,
  footer,
  className,
}: SidebarShellProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-card bg-card",
        "transition-[width] duration-200",
        collapsed ? "w-10" : "w-60",
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-2 py-5">
        {!collapsed && (
          <>
            <BookmarkIcon size={15} className="ml-2 text-foreground/50" />
            <span className="flex-1 text-sm font-semibold tracking-tight">URL Gallery</span>
          </>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpenIcon size={15} /> : <PanelLeftCloseIcon size={15} />}
        </button>
      </div>

      {!collapsed && children}

      {!collapsed && <div className="mt-auto shrink-0">{footer}</div>}
    </aside>
  )
}
