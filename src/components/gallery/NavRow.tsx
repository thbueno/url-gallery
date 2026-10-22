import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Shared row look for sidebar nav items and tag rows. */
export const navRowVariants = cva(
  [
    "flex w-full items-center gap-2.5 rounded-inner border border-transparent px-2.5 py-1.5 text-left text-sm font-medium outline-none",
    "transition-[background-color,color,box-shadow,border-color,transform] duration-150 ease-out active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100",
  ],
  {
    variants: {
      active: {
        true: "border-border bg-surface-inner text-foreground shadow-xs",
        false: "text-muted-foreground hover:bg-surface-tertiary/60 hover:text-foreground",
      },
      /** Icon-only square, used by the collapsed sidebar rail. */
      compact: {
        true: "size-9 justify-center px-0 py-0",
        false: "",
      },
    },
    defaultVariants: { active: false, compact: false },
  }
)

interface NavRowProps extends VariantProps<typeof navRowVariants> {
  label: string
  icon?: React.ReactNode
  count?: number
  onClick: () => void
  className?: string
}

/** A nav item: optional icon, label and a tabular count. `compact` shows the icon only. */
export function NavRow({ label, icon, count, active, compact, onClick, className }: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
      className={cn(navRowVariants({ active, compact }), className)}
    >
      {icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {compact ? null : (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {count !== undefined ? (
            <span className="shrink-0 text-xs font-normal tabular-nums">{count}</span>
          ) : null}
        </>
      )}
    </button>
  )
}
