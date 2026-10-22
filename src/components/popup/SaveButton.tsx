import { Bookmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SaveState } from "@/hooks/usePopupSave"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  state: SaveState
  onClick: () => void
  className?: string
}

/**
 * Full-width primary action. Gradient while the page is unsaved (idle, saving, error);
 * a quiet bordered control with a filled bookmark once saved.
 */
export function SaveButton({ state, onClick, className }: SaveButtonProps) {
  const saved = state === "saved-full" || state === "saved-favicon"
  return (
    <Button
      variant={saved ? "outline" : "gradient"}
      className={cn("w-full", className)}
      disabled={state === "saving"}
      onClick={onClick}
    >
      <Bookmark className={cn(saved && "fill-current")} aria-hidden="true" />
      {state === "saving" ? "Saving…" : saved ? "Saved!" : "Save this tab"}
    </Button>
  )
}
