import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PermissionPromptProps {
  onGrant: () => void
  className?: string
}

/** Section-surface panel inviting the user to grant access for richer thumbnails. */
export function PermissionPrompt({ onGrant, className }: PermissionPromptProps) {
  return (
    <div className={cn("flex flex-col gap-2.5 rounded-card bg-surface-section p-3", className)}>
      <p className="text-[length:var(--text-xs)] leading-snug text-muted-foreground">
        Enable richer thumbnails by granting access to fetch preview images.
      </p>
      <Button variant="outline" size="sm" onClick={onGrant}>
        <ShieldCheck aria-hidden="true" />
        Enable better thumbnails
      </Button>
    </div>
  )
}
