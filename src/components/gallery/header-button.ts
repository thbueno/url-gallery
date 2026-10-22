import { cva } from "class-variance-authority"

/** Classes layered on `<Button variant="outline">` for the controls in the gallery header. */
export const headerButtonVariants = cva(
  "h-9 gap-2 rounded-inner [&_svg]:size-3.5 border-border bg-surface-inner px-3 shadow-xs transition-[border-color,background-color,transform] duration-150 ease-out hover:bg-surface-inner active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
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
