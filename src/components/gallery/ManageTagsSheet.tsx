import { useRef, useState } from "react"

import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import type { TagCount } from "@/components/gallery/CategoryFilter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface ManageTagsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: TagCount[]
  onRename: (oldName: string, newName: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
  onAdd: (name: string) => Promise<void>
}

export function ManageTagsSheet({
  open,
  onOpenChange,
  tags,
  onRename,
  onDelete,
  onAdd,
}: ManageTagsSheetProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [addValue, setAddValue] = useState("")
  const [busy, setBusy] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  function startEdit(name: string) {
    setEditingTag(name)
    setEditValue(name)
    setConfirmDelete(null)
    setTimeout(() => editInputRef.current?.select(), 0)
  }

  async function commitEdit() {
    if (!editingTag) return
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== editingTag) {
      setBusy(true)
      try {
        await onRename(editingTag, trimmed)
      } finally {
        setBusy(false)
      }
    }
    setEditingTag(null)
  }

  async function handleDelete(name: string) {
    if (confirmDelete !== name) {
      setConfirmDelete(name)
      setEditingTag(null)
      return
    }
    setBusy(true)
    try {
      await onDelete(name)
    } finally {
      setBusy(false)
      setConfirmDelete(null)
    }
  }

  async function handleAdd() {
    const trimmed = addValue.trim()
    if (!trimmed) return
    if (tags.some((t) => t.name === trimmed)) return
    setBusy(true)
    try {
      await onAdd(trimmed)
      setAddValue("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-sm">Manage Tags</SheetTitle>
        </SheetHeader>

        {/* Add tag form */}
        <div className="flex gap-2 border-b border-border px-3 py-2.5">
          <Input
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
            placeholder="New tag name…"
            className="h-7 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={!addValue.trim() || busy}
            onClick={handleAdd}
            className="h-7 shrink-0 px-2"
          >
            <PlusIcon size={13} />
          </Button>
        </div>

        {/* Tag list */}
        <div className="flex-1 overflow-auto py-1">
          {tags.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No tags yet.</p>
          )}
          {tags.map((tag) => (
            <div
              key={tag.name}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5",
                confirmDelete === tag.name && "bg-destructive/5"
              )}
            >
              {editingTag === tag.name ? (
                <Input
                  ref={editInputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit()
                    if (e.key === "Escape") setEditingTag(null)
                  }}
                  onBlur={commitEdit}
                  disabled={busy}
                  className="h-6 flex-1 px-1.5 text-xs"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm">{tag.name}</span>
              )}

              <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">
                {tag.count}
              </span>

              {editingTag !== tag.name && confirmDelete !== tag.name && (
                <button
                  type="button"
                  onClick={() => startEdit(tag.name)}
                  aria-label={`Rename ${tag.name}`}
                  className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                >
                  <PencilIcon size={12} />
                </button>
              )}

              {confirmDelete === tag.name ? (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.name)}
                    disabled={busy}
                    className="text-[10px] font-medium text-destructive hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XIcon size={11} />
                  </button>
                </div>
              ) : (
                editingTag !== tag.name && (
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.name)}
                    aria-label={`Delete ${tag.name}`}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2Icon size={12} />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
