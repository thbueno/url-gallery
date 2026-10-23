import { cn } from "@/lib/utils"

interface SidebarFooterProps {
  /** Short-lived status line shown above the actions (e.g. "Backup downloaded"). */
  status?: string | null
  /** Footer contents, stacked (Data menu row, theme toggle). */
  children?: React.ReactNode
  className?: string
}

export function SidebarFooter({ status, children, className }: SidebarFooterProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 px-0.5 pb-0.5", className)}>
      {status && (
        <p className="px-2.5 text-[length:var(--text-xs)] text-muted-foreground">{status}</p>
      )}
      {children}
    </div>
  )
}
