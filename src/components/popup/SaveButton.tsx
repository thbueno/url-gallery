import { type VariantProps, cva } from "class-variance-authority"
import { Bookmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const bookmarkIconVariants = cva("", {
  variants: {
    saved: {
      true: "fill-current",
      false: "",
    },
  },
  defaultVariants: { saved: false },
})

interface SaveButtonProps extends VariantProps<typeof bookmarkIconVariants> {
  /** True while a save is in flight (disables the button). */
  saving: boolean
  onClick: () => void
  className?: string
}

/**
 * Primary save action. Gradient while the page is unsaved (idle, saving, error);
 * a quiet bordered control with a filled bookmark once saved.
 */
export function SaveButton({ saved, saving, onClick, className }: SaveButtonProps) {
  return (
    <Button
      variant={saved ? "outline" : "gradient"}
      className={className}
      disabled={saving}
      onClick={onClick}
    >
      <Bookmark className={cn(bookmarkIconVariants({ saved }))} aria-hidden="true" />
      {saving ? "Saving…" : saved ? "Saved!" : "Save this tab"}
    </Button>
  )
}
