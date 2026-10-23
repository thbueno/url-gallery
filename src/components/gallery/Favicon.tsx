import { type VariantProps, cva } from "class-variance-authority"
import { useEffect, useState } from "react"

import { getDomain } from "@/lib/format"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

const faviconVariants = cva("shrink-0 select-none", {
  variants: {
    size: {
      sm: "size-4 rounded-sm text-[length:var(--text-xs)]",
      lg: "size-12 rounded-lg text-xl",
    },
  },
  defaultVariants: { size: "sm" },
})

interface FaviconProps extends VariantProps<typeof faviconVariants> {
  site: Pick<SavedSite, "url" | "title" | "favicon">
  className?: string
}

/** Site icon. Falls back to a letter mark (first letter of the domain) when missing or broken. */
export function Favicon({ site, size, className }: FaviconProps) {
  const [failed, setFailed] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: forget an old failure when the icon url changes
  useEffect(() => setFailed(false), [site.favicon])

  if (!site.favicon || failed) {
    const letter = (getDomain(site.url) || site.title || "?").charAt(0)
    return (
      <span
        aria-hidden="true"
        className={cn(
          faviconVariants({ size }),
          "inline-flex items-center justify-center bg-accent-soft font-medium uppercase text-accent-soft-foreground",
          className
        )}
      >
        {letter}
      </span>
    )
  }

  return (
    <img
      src={site.favicon}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(faviconVariants({ size }), "bg-surface-inner object-contain", className)}
    />
  )
}
