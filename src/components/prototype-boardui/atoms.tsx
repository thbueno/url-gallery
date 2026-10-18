import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { Button } from "@/components/ui/button"
import type { SavedSite } from "@/lib/store"
import { cn } from "@/lib/utils"

import { getDomain } from "./helpers"

/** Blob -> object URL with cleanup. Returns undefined for a null blob. */
export function useThumbUrl(blob: Blob | null | undefined): string | undefined {
  const [url, setUrl] = React.useState<string>()
  React.useEffect(() => {
    if (!blob) {
      setUrl(undefined)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

const letterMark = cva(
  "inline-flex shrink-0 select-none items-center justify-center bg-[hsl(var(--accent-soft))] font-medium uppercase text-[hsl(var(--accent-soft-foreground))]",
  {
    variants: {
      size: {
        xs: "size-4 rounded-sm text-[0.625rem]",
        sm: "size-5 rounded-sm text-xs",
        md: "size-6 rounded-sm text-xs",
        lg: "size-8 rounded-md text-sm",
        xl: "size-12 rounded-lg text-xl",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const faviconImg = cva("shrink-0 bg-[hsl(var(--surface-inner))] object-contain", {
  variants: {
    size: {
      xs: "size-4 rounded-sm",
      sm: "size-5 rounded-sm",
      md: "size-6 rounded-sm",
      lg: "size-8 rounded-md",
      xl: "size-12 rounded-lg",
    },
  },
  defaultVariants: { size: "md" },
})

export interface FaviconProps extends VariantProps<typeof faviconImg> {
  site: Pick<SavedSite, "url" | "title" | "favicon">
  className?: string
}

/** Site favicon; falls back to a letter-mark (first letter of the domain) if missing or broken. */
export function Favicon({ site, size, className }: FaviconProps) {
  const [failed, setFailed] = React.useState(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the failure flag when the icon url changes
  React.useEffect(() => setFailed(false), [site.favicon])
  if (!site.favicon || failed) {
    const letter = (getDomain(site.url) || site.title || "?").charAt(0)
    return (
      <span className={cn(letterMark({ size }), className)} aria-hidden="true">
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
      className={cn(faviconImg({ size }), className)}
    />
  )
}

export interface SiteThumbProps {
  site: SavedSite
  /** Size/shape/radius come from the parent, e.g. "aspect-video w-full rounded-lg". */
  className?: string
}

/**
 * Thumbnail with graceful fallback. With a thumb blob: the image, covered, plus a 1px inset
 * outline. Without: a tertiary-grey plate with the favicon (or letter-mark) centred.
 * Defaults to `aspect-video w-full`; the parent owns radius (the image inherits it).
 */
export function SiteThumb({ site, className }: SiteThumbProps) {
  const url = useThumbUrl(site.thumb)
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-[hsl(var(--surface-tertiary))]",
        className
      )}
    >
      {url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          className="size-full rounded-[inherit] object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Favicon site={site} size="xl" />
        </div>
      )}
      {/* image outline: 1px inset, low alpha, sits above the image */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.08)]"
      />
    </div>
  )
}

const primaryButton = cva(
  [
    "relative isolate overflow-hidden border-0 font-medium text-primary-foreground",
    "bg-[linear-gradient(180deg,hsl(var(--primary-gradient-from)),hsl(var(--primary-gradient-to)))]",
    // CSS can't transition gradients: the hover gradient fades in via ::before (BoardUI technique)
    "before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-150 before:ease-out before:content-['']",
    "before:bg-[linear-gradient(180deg,hsl(var(--primary-gradient-hover-from)),hsl(var(--primary-gradient-hover-to)))]",
    "hover:before:opacity-100 hover:bg-primary",
    "transition-transform duration-150 ease-out active:scale-[0.98]",
  ],
  { variants: {}, defaultVariants: {} }
)

export type PrimaryButtonProps = React.ComponentProps<typeof Button>

/**
 * The only filled-gradient control in BoardUI. Built on the shadcn Button; colours come from
 * --primary-gradient-* tokens so it re-themes with the palette.
 */
export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, style, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(primaryButton(), className)}
      style={{ boxShadow: "var(--shadow-primary)", ...style }}
      {...props}
    />
  )
)
PrimaryButton.displayName = "PrimaryButton"
