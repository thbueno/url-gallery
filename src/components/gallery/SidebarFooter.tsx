import { cn } from "@/lib/utils"

interface SidebarFooterProps {
  /** Short-lived status line shown above the actions (e.g. "Backup downloaded"). */
  status?: string | null
  /** Action row contents (Data menu, dev tools, theme toggle). */
  children?: React.ReactNode
  className?: string
}

export function SidebarFooter({ status, children, className }: SidebarFooterProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-2", className)}>
      {status && <p className="px-2 text-[11px] text-muted-foreground">{status}</p>}
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
