import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const headerButtonVariants = cva(
  "h-9 gap-2 rounded-inner border-border bg-surface-inner px-3 shadow-xs transition-[border-color,background-color,transform] duration-150 ease-out hover:bg-surface-inner active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-3.5",
  {
    variants: {
      /** The button is a toggle that is currently on. */
      pressed: {
        true: "border-border-hover bg-surface-tertiary hover:bg-surface-tertiary",
        false: "",
      },
    },
    defaultVariants: { pressed: false },
  }
)

export interface HeaderButtonProps
  extends Omit<ButtonProps, "variant" | "size" | "asChild">,
    VariantProps<typeof headerButtonVariants> {}

/** Outline button for the gallery header. Pass `pressed` to make it a toggle. */
export const HeaderButton = React.forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ className, pressed, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      aria-pressed={pressed ?? undefined}
      className={cn(headerButtonVariants({ pressed }), className)}
      {...props}
    />
  )
)
HeaderButton.displayName = "HeaderButton"
