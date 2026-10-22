import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const sidebarInputVariants = cva(
  "rounded-inner border-border bg-surface-inner text-sm shadow-xs transition-[border-color,box-shadow] duration-150 ease-out hover:border-border-hover focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
  {
    variants: {
      size: {
        /** Search field. */
        md: "h-9",
        /** Inline rename / add-tag fields. */
        sm: "h-8 px-2",
      },
    },
    defaultVariants: { size: "md" },
  }
)

export interface SidebarInputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof sidebarInputVariants> {}

/** Text field in the sidebar's look (Board surface, soft radius), built on the shared Input. */
export const SidebarInput = React.forwardRef<HTMLInputElement, SidebarInputProps>(
  ({ className, size, ...props }, ref) => (
    <Input ref={ref} className={cn(sidebarInputVariants({ size }), className)} {...props} />
  )
)
SidebarInput.displayName = "SidebarInput"
