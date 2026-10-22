import { DatabaseIcon } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DataMenuProps {
  onExport: () => void | Promise<void>
  onImportFile: (file: File) => void | Promise<void>
  onCopyForAI: () => void | Promise<void>
  /** Applied to the root element. */
  className?: string
}

/** "Data" dropdown: export backup, import backup (hidden file input), copy for AI. */
export function DataMenu({ onExport, onImportFile, onCopyForAI, className }: DataMenuProps) {
  const importInputRef = useRef<HTMLInputElement>(null)

  function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    void onImportFile(file)
  }

  return (
    <div className={cn("flex", className)}>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportChange}
        className="hidden"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 flex-1 justify-start gap-2 rounded-inner px-2.5 text-sm text-muted-foreground hover:bg-surface-tertiary/60 hover:text-foreground"
          >
            <DatabaseIcon />
            Data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-44">
          <DropdownMenuItem onSelect={onExport}>Export backup</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => importInputRef.current?.click()}>
            Import backup
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onCopyForAI}>Copy for AI</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
