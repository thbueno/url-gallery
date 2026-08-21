import { useRef, useState } from "react"

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, InfoIcon, PencilIcon, PinIcon, PlusIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  tagOrder: string[]
  totalCount: number
  onSelect: (tags: string[]) => void
  onTogglePinTag: (tag: string) => void
  onRenameTag: (oldName: string, newName: string) => Promise<void>
  onDeleteTag: (name: string) => Promise<void>
  onAddTag: (name: string) => Promise<void>
  onReorderTags: (order: string[]) => void
}

const PINNED_ZONE_ID = "pinned-zone"
const TAGS_ZONE_ID = "tags-zone"

interface TagRowProps {
  tag: TagCount
  pinned: boolean
  isActive: boolean
  isEditing: boolean
  editValue: string
  busy: boolean
  editInputRef: React.RefObject<HTMLInputElement>
  onToggle: () => void
  onStartEdit: () => void
  onEditValueChange: (value: string) => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}

function TagRow({
  tag,
  pinned,
  isActive,
  isEditing,
  editValue,
  busy,
  editInputRef,
  onToggle,
  onStartEdit,
  onEditValueChange,
  onCommitEdit,
  onCancelEdit,
  onDelete,
  onTogglePin,
}: TagRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag.name,
  })
  const editRowRef = useRef<HTMLDivElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group relative flex items-center", isDragging && "z-10 opacity-70")}
    >
      {isEditing ? (
        <div ref={editRowRef} className="flex min-w-0 flex-1 items-center gap-1 py-1">
          <Input
            ref={editInputRef}
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitEdit()
              if (e.key === "Escape") onCancelEdit()
            }}
            onBlur={(e) => {
              // Blurring to the delete trigger (or its dialog) must not collapse
              // edit mode first — that unmounts the trigger before its click lands.
              if (editRowRef.current?.contains(e.relatedTarget as Node)) return
              onCommitEdit()
            }}
            disabled={busy}
            className="h-6 min-w-0 flex-1 px-1.5 text-xs"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label={`Delete ${tag.name}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon size={12} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete tag "{tag.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the tag from all sites carrying it. This action can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={busy}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <>
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${tag.name}`}
            className="flex size-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-100 active:cursor-grabbing"
          >
            <GripVerticalIcon size={11} />
          </button>

          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-medium text-accent-foreground"
                : "text-sidebar-foreground hover:bg-accent/60"
            )}
          >
            <span className="min-w-0 truncate pr-9">{tag.name}</span>
          </button>

          {/* Edit button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
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
              onTogglePin()
            }}
            aria-label={pinned ? `Unpin ${tag.name}` : `Pin ${tag.name}`}
            className={cn(
              "absolute right-1.5 flex size-4 items-center justify-center rounded transition-opacity",
              pinned
                ? "opacity-100 text-foreground"
                : "opacity-0 group-hover:opacity-60 text-muted-foreground hover:!opacity-100"
            )}
          >
            <PinIcon size={10} className={cn(pinned && "fill-foreground")} />
          </button>
        </>
      )}
    </div>
  )
}

function TagZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="flex flex-col gap-1">
      {children}
    </div>
  )
}

export function CategoryFilter({
  tags,
  activeTags,
  pinnedTags,
  tagOrder,
  totalCount,
  onSelect,
  onTogglePinTag,
  onRenameTag,
  onDeleteTag,
  onAddTag,
  onReorderTags,
}: CategoryFilterProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [adding, setAdding] = useState(false)
  const [addValue, setAddValue] = useState("")
  const [busy, setBusy] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const uncategorizedCount = tags.find((c) => c.name === "Uncategorized")?.count ?? 0
  const showUncategorizedNotice = uncategorizedCount > 0 && totalCount > 0

  const known = new Set(tagOrder)
  const effectiveOrder = [...tagOrder, ...tags.map((t) => t.name).filter((n) => !known.has(n))]
  const byName = new Map(tags.map((t) => [t.name, t]))

  const pinnedTagRows = effectiveOrder
    .filter((name) => pinnedTags.includes(name))
    .map((name) => byName.get(name))
    .filter((t): t is TagCount => t !== undefined)

  const unpinnedTagRows = effectiveOrder
    .filter((name) => !pinnedTags.includes(name))
    .map((name) => byName.get(name))
    .filter((t): t is TagCount => t !== undefined)

  function toggleTag(name: string) {
    onSelect(activeTags.includes(name) ? [] : [name])
  }

  function startEdit(name: string) {
    setEditingTag(name)
    setEditValue(name)
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
    setBusy(true)
    try {
      await onDeleteTag(name)
    } finally {
      setBusy(false)
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeName = String(active.id)
    const overId = String(over.id)
    const wasPinned = pinnedTags.includes(activeName)

    let targetPinned: boolean
    if (overId === PINNED_ZONE_ID) {
      targetPinned = true
    } else if (overId === TAGS_ZONE_ID) {
      targetPinned = false
    } else {
      targetPinned = pinnedTags.includes(overId)
    }

    const nextOrder = effectiveOrder.filter((name) => name !== activeName)
    const overIndex = nextOrder.indexOf(overId)
    const insertIndex = overIndex === -1 ? nextOrder.length : overIndex
    nextOrder.splice(insertIndex, 0, activeName)

    if (nextOrder.join("|") !== effectiveOrder.join("|")) {
      onReorderTags(nextOrder)
    }
    if (targetPinned !== wasPinned) {
      onTogglePinTag(activeName)
    }
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
      </button>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {pinnedTagRows.length > 0 && (
          <p className="mb-1 mt-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Pinned
          </p>
        )}
        <SortableContext
          items={pinnedTagRows.map((t) => t.name)}
          strategy={verticalListSortingStrategy}
        >
          <TagZone id={PINNED_ZONE_ID}>
            {pinnedTagRows.map((tag) => (
              <TagRow
                key={tag.name}
                tag={tag}
                pinned
                isActive={activeTags.includes(tag.name)}
                isEditing={editingTag === tag.name}
                editValue={editValue}
                busy={busy}
                editInputRef={editInputRef}
                onToggle={() => toggleTag(tag.name)}
                onStartEdit={() => startEdit(tag.name)}
                onEditValueChange={setEditValue}
                onCommitEdit={commitEdit}
                onCancelEdit={() => setEditingTag(null)}
                onDelete={() => handleDelete(tag.name)}
                onTogglePin={() => onTogglePinTag(tag.name)}
              />
            ))}
          </TagZone>
        </SortableContext>

        {pinnedTagRows.length > 0 && unpinnedTagRows.length > 0 && (
          <p className="mb-1 mt-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Tags
          </p>
        )}
        <SortableContext
          items={unpinnedTagRows.map((t) => t.name)}
          strategy={verticalListSortingStrategy}
        >
          <TagZone id={TAGS_ZONE_ID}>
            {unpinnedTagRows.map((tag) => (
              <TagRow
                key={tag.name}
                tag={tag}
                pinned={false}
                isActive={activeTags.includes(tag.name)}
                isEditing={editingTag === tag.name}
                editValue={editValue}
                busy={busy}
                editInputRef={editInputRef}
                onToggle={() => toggleTag(tag.name)}
                onStartEdit={() => startEdit(tag.name)}
                onEditValueChange={setEditValue}
                onCommitEdit={commitEdit}
                onCancelEdit={() => setEditingTag(null)}
                onDelete={() => handleDelete(tag.name)}
                onTogglePin={() => onTogglePinTag(tag.name)}
              />
            ))}
          </TagZone>
        </SortableContext>
      </DndContext>

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
