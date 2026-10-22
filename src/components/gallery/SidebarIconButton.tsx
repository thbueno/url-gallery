import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarIconButtonVariants = cva("focus-visible:ring-2", {
  variants: {
    size: {
      /** Per-row actions: edit, pin, delete, add. */
      sm: "size-6 [&_svg]:size-3.5",
      /** Panel header toggle while the sidebar is open. */
      md: "size-7",
      /** Panel header toggle in the collapsed rail. */
      lg: "size-9 rounded-inner",
    },
    tone: {
      default: "text-muted-foreground hover:bg-surface-tertiary hover:text-foreground",
      destructive: "text-muted-foreground hover:bg-surface-tertiary hover:text-destructive",
    },
  },
  defaultVariants: { size: "sm", tone: "default" },
})

export interface SidebarIconButtonProps
  extends Omit<ButtonProps, "variant" | "size" | "asChild">,
    VariantProps<typeof sidebarIconButtonVariants> {}

/** Small square icon button for the sidebar, built on the shared Button. */
export const SidebarIconButton = React.forwardRef<HTMLButtonElement, SidebarIconButtonProps>(
  ({ className, size, tone, ...props }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn(sidebarIconButtonVariants({ size, tone }), className)}
      {...props}
    />
  )
)
SidebarIconButton.displayName = "SidebarIconButton"
