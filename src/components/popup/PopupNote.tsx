import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const popupNoteVariants = cva("px-1 text-[length:var(--text-xs)] leading-snug", {
  variants: {
    tone: {
      muted: "text-muted-foreground",
      error: "font-medium text-destructive",
    },
  },
  defaultVariants: { tone: "muted" },
})

interface PopupNoteProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof popupNoteVariants> {}

/** Small status text under the save button: hints, the decline note, and save errors. */
export function PopupNote({ tone, className, ...props }: PopupNoteProps) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={cn(popupNoteVariants({ tone }), className)}
      {...props}
    />
  )
}
