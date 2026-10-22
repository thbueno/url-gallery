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
import { cva } from "class-variance-authority"
import { GripVerticalIcon, InfoIcon, PencilIcon, PinIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { navRowVariants } from "@/components/gallery/NavRow"
import { SidebarIconButton } from "@/components/gallery/SidebarIconButton"
import { SidebarInput } from "@/components/gallery/SidebarInput"
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

const sectionLabelClass =
  "px-2.5 pb-1.5 pt-4 text-[length:var(--text-xs)] font-medium uppercase tracking-wider text-muted-foreground"

const tagRowVariants = cva("group/row relative", {
  variants: {
    dragging: {
      true: "z-10 opacity-70",
      false: "",
    },
  },
  defaultVariants: { dragging: false },
})

/** Edit and pin buttons overlaid on the right side of a tag row. */
const rowActionVariants = cva(
  "absolute top-1/2 -translate-y-1/2 transition-[opacity,color,background-color] duration-150 focus-visible:opacity-100",
  {
    variants: {
      slot: {
        edit: "right-8",
        pin: "right-1.5",
      },
      /** `hover`: shown while the row is hovered. `pinned`: always shown, in full colour. */
      reveal: {
        hover: "opacity-0 group-hover/row:opacity-100",
        pinned: "text-foreground opacity-100",
      },
    },
    defaultVariants: { slot: "edit", reveal: "hover" },
  }
)

const pinIconVariants = cva("", {
  variants: {
    pinned: {
      true: "fill-current",
      false: "",
    },
  },
  defaultVariants: { pinned: false },
})

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
    <div ref={setNodeRef} style={style} className={tagRowVariants({ dragging: isDragging })}>
      {isEditing ? (
        <div ref={editRowRef} className="flex min-w-0 flex-1 items-center gap-1.5 py-0.5 pl-1">
          <SidebarInput
            ref={editInputRef}
            size="sm"
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
            className="min-w-0 flex-1"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <SidebarIconButton
                tone="destructive"
                aria-label={`Delete ${tag.name}`}
                className="shrink-0"
              >
                <Trash2Icon />
              </SidebarIconButton>
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
            onClick={onToggle}
            aria-current={isActive ? "true" : undefined}
            className={cn(navRowVariants({ active: isActive }), "pr-9")}
          >
            <span className="min-w-0 flex-1 truncate">{tag.name}</span>
            <span className="shrink-0 text-xs font-normal tabular-nums transition-opacity group-focus-within/row:opacity-0 group-hover/row:opacity-0">
              {tag.count}
            </span>
          </button>

          {/* Drag handle: sits in the row's left padding, shown on hover */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${tag.name}`}
            className="absolute inset-y-1 left-0 flex w-3 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 outline-none transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/row:opacity-60 hover:!opacity-100 active:cursor-grabbing"
          >
            <GripVerticalIcon className="size-2.5" />
          </button>

          {/* Edit button (replaces the count while the row is hovered) */}
          <SidebarIconButton
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
            aria-label={`Edit ${tag.name}`}
            className={rowActionVariants({ slot: "edit", reveal: "hover" })}
          >
            <PencilIcon />
          </SidebarIconButton>

          {/* Pin toggle: always visible while pinned, otherwise on hover */}
          <SidebarIconButton
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin()
            }}
            aria-label={pinned ? `Unpin ${tag.name}` : `Pin ${tag.name}`}
            aria-pressed={pinned}
            className={rowActionVariants({ slot: "pin", reveal: pinned ? "pinned" : "hover" })}
          >
            <PinIcon className={pinIconVariants({ pinned })} />
          </SidebarIconButton>
        </>
      )}
    </div>
  )
}

function TagZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="flex flex-col gap-0.5">
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
    <nav aria-label="Tags" className="flex flex-col gap-0.5 px-0.5 pb-2">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {pinnedTagRows.length > 0 && <p className={sectionLabelClass}>Pinned</p>}
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

        <div className="flex items-center justify-between pr-1">
          <p className={sectionLabelClass}>Tags</p>
          <SidebarIconButton onClick={startAdd} aria-label="Add tag" className="mt-3">
            <PlusIcon />
          </SidebarIconButton>
        </div>

        {adding && (
          <div className="mb-1 flex items-center gap-1">
            <SidebarInput
              ref={addInputRef}
              size="sm"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitAdd()
                if (e.key === "Escape") setAdding(false)
              }}
              onBlur={commitAdd}
              disabled={busy}
              placeholder="New tag name…"
              className="flex-1"
            />
          </div>
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
        <div className="mt-3 flex items-start gap-1.5 rounded-inner bg-surface-tertiary/50 px-2.5 py-2">
          <InfoIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
          <p className="text-[length:var(--text-xs)] leading-snug text-muted-foreground">
            {uncategorizedCount === totalCount
              ? "All sites are uncategorized — tags are auto-detected from OG tags and domain."
              : `${uncategorizedCount} site${uncategorizedCount !== 1 ? "s" : ""} couldn't be auto-tagged.`}
          </p>
        </div>
      )}
    </nav>
  )
}
