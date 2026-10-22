import { ListChecksIcon } from "lucide-react"

import { HeaderButton } from "@/components/gallery/HeaderButton"

interface SelectModeButtonProps {
  selectMode: boolean
  onToggle: () => void
  className?: string
}

/** Header toggle that turns bulk select mode on and off. */
export function SelectModeButton({ selectMode, onToggle, className }: SelectModeButtonProps) {
  return (
    <HeaderButton pressed={selectMode} onClick={onToggle} className={className}>
      <ListChecksIcon className="text-muted-foreground" aria-hidden="true" />
      {selectMode ? "Cancel" : "Select"}
    </HeaderButton>
  )
}
