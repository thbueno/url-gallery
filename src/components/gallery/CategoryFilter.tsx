import { useRef, useState } from "react"

import { InfoIcon, PencilIcon, PinIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface TagCount {
  name: string
  count: number
}

interface CategoryFilterProps {
  tags: TagCount[]
  activeTags: string[]
  pinnedTags: string[]
  totalCount: number
  onSelect: (tags: string[]) => void
  onTogglePinTag: (tag: string) => void
  onRenameTag: (oldName: string, newName: string) => Promise<void>
  onDeleteTag: (name: string) => Promise<void>
  onAddTag: (name: string) => Promise<void>
}

export function CategoryFilter({
  tags,
  activeTags,
  pinnedTags,
  totalCount,
  onSelect,
  onTogglePinTag,
  onRenameTag,
  onDeleteTag,
  onAddTag,
}: CategoryFilterProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [addValue, setAddValue] = useState("")
  const [busy, setBusy] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)

  const uncategorizedCount = tags.find((c) => c.name === "Uncategorized")?.count ?? 0
  const showUncategorizedNotice = uncategorizedCount > 0 && totalCount > 0

  function toggleTag(name: string) {
    onSelect(activeTags.includes(name) ? [] : [name])
  }

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
        await onRenameTag(editingTag, trimmed)
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
      await onDeleteTag(name)
    } finally {
      setBusy(false)
      setConfirmDelete(null)
    }
  }

  function startAdd() {
    setAdding(true)
    setAddValue("")
    setTimeout(() => addInputRef.current?.focus(), 0)
  }

  async function commitAdd() {
    const trimmed = addValue.trim()
    if (trimmed && !tags.some((t) => t.name === trimmed)) {
      setBusy(true)
      try {
        await onAddTag(trimmed)
      } finally {
        setBusy(false)
      }
    }
    setAdding(false)
    setAddValue("")
  }

  return (
    <nav className="flex flex-col gap-1 px-2 pb-4">
      <div className="mb-1 flex items-center justify-between px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Tags
        </p>
        <button
          type="button"
          onClick={startAdd}
          aria-label="Add tag"
          className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <PlusIcon size={11} />
        </button>
      </div>

      {adding && (
        <div className="mb-1 flex items-center gap-1 px-2">
          <Input
            ref={addInputRef}
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAdd()
              if (e.key === "Escape") setAdding(false)
            }}
            onBlur={commitAdd}
            disabled={busy}
            placeholder="New tag name…"
            className="h-6 flex-1 px-1.5 text-xs"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onSelect([])}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
          activeTags.length === 0
            ? "bg-accent font-medium text-accent-foreground"
            : "text-sidebar-foreground hover:bg-accent/60"
        )}
      >
        <span>All</span>
        <span className="tabular-nums text-xs text-muted-foreground">{totalCount}</span>
      </button>

      {tags.map((tag) => (
        <div key={tag.name} className="group relative flex items-center">
          {editingTag === tag.name ? (
            <div className="flex min-w-0 flex-1 items-center gap-1 py-1">
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
                className="h-6 min-w-0 flex-1 px-1.5 text-xs"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDelete(tag.name)}
                aria-label={`Delete ${tag.name}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon size={12} />
              </button>
            </div>
          ) : confirmDelete === tag.name ? (
            <div className="flex min-w-0 flex-1 items-center justify-between rounded-md bg-destructive/5 px-2 py-1.5">
              <span className="min-w-0 truncate text-sm text-muted-foreground">{tag.name}</span>
              <div className="flex shrink-0 items-center gap-1.5">
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
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                  activeTags.includes(tag.name)
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-accent/60"
                )}
              >
                <span className="min-w-0 truncate pr-9">{tag.name}</span>
                <span className="ml-2 shrink-0 tabular-nums text-xs text-muted-foreground">
                  {tag.count}
                </span>
              </button>

              {/* Edit button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  startEdit(tag.name)
                }}
                aria-label={`Edit ${tag.name}`}
                className="absolute right-7 flex size-4 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
              >
                <PencilIcon size={10} />
              </button>

              {/* Pin button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePinTag(tag.name)
                }}
                aria-label={pinnedTags.includes(tag.name) ? `Unpin ${tag.name}` : `Pin ${tag.name}`}
                className={cn(
                  "absolute right-1.5 flex size-4 items-center justify-center rounded transition-opacity",
                  pinnedTags.includes(tag.name)
                    ? "opacity-100 text-foreground"
                    : "opacity-0 group-hover:opacity-60 text-muted-foreground hover:!opacity-100"
                )}
              >
                <PinIcon
                  size={10}
                  className={cn(pinnedTags.includes(tag.name) && "fill-foreground")}
                />
              </button>
            </>
          )}
        </div>
      ))}

      {showUncategorizedNotice && (
        <div className="mt-3 flex items-start gap-1.5 rounded-md bg-muted/50 px-2 py-2">
          <InfoIcon size={11} className="mt-0.5 shrink-0 text-muted-foreground/70" />
          <p className="text-[10px] leading-snug text-muted-foreground">
            {uncategorizedCount === totalCount
              ? "All sites are uncategorized — tags are auto-detected from OG tags and domain."
              : `${uncategorizedCount} site${uncategorizedCount !== 1 ? "s" : ""} couldn't be auto-tagged.`}
          </p>
        </div>
      )}
    </nav>
  )
}
