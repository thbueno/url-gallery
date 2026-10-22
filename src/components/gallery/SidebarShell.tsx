import { BookmarkIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"

import { cva } from "class-variance-authority"

import { SidebarIconButton } from "@/components/gallery/SidebarIconButton"
import { cn } from "@/lib/utils"

const headerVariants = cva("flex shrink-0 items-center gap-2.5", {
  variants: {
    collapsed: {
      true: "",
      false: "px-1 pt-1",
    },
  },
  defaultVariants: { collapsed: false },
})

const sidebarVariants = cva(
  "flex shrink-0 flex-col gap-3 overflow-hidden rounded-card bg-surface-section p-1.5 transition-[width] duration-200 motion-reduce:transition-none",
  {
    variants: {
      collapsed: {
        true: "w-12",
        false: "w-sidebar",
      },
    },
    defaultVariants: { collapsed: false },
  }
)

interface SidebarShellProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  /** Main body, shown only while expanded (search, nav, tag list). */
  children?: React.ReactNode
  /** Shown instead of the body while collapsed (icon-only controls). */
  rail?: React.ReactNode
  /** Pinned to the bottom, shown only while expanded. */
  footer?: React.ReactNode
  className?: string
}

/** Inset section-surface panel: brand + collapse toggle on top, body, footer at the bottom. */
export function SidebarShell({
  collapsed,
  onToggleCollapsed,
  children,
  rail,
  footer,
  className,
}: SidebarShellProps) {
  return (
    <aside className={cn(sidebarVariants({ collapsed }), className)}>
      <div className={headerVariants({ collapsed })}>
        {!collapsed && (
          <>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-gradient text-primary-foreground shadow-primary">
              <BookmarkIcon className="size-3.5" aria-hidden="true" />
            </span>
            <span className="flex-1 truncate text-sm font-semibold tracking-tight">
              URL Gallery
            </span>
          </>
        )}
        <SidebarIconButton
          size={collapsed ? "lg" : "md"}
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </SidebarIconButton>
      </div>

      {collapsed ? rail : children}

      {!collapsed && <div className="mt-auto shrink-0">{footer}</div>}
    </aside>
  )
}
