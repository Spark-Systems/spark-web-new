"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@admin/lib/utils"
import type { DropzoneItem } from "./file-dropzone"

function SortableTile({
  item,
  index,
  disabled,
  onRemove,
}: {
  item: DropzoneItem
  index: number
  disabled?: boolean
  onRemove: () => void
}) {
  const t = useTranslations("Inputs.dropzone")
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={t("reorderItem", { position: index + 1, name: item.name })}
      className={cn(
        "group bg-muted relative aspect-[4/3] touch-none overflow-hidden rounded-lg border outline-none select-none",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isDragging && "ring-primary z-10 opacity-80 shadow-lg ring-2"
      )}
    >
      {/* Plain <img>: previews are blob:/data: URLs; next/image can't optimize those. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt="" draggable={false} className="size-full object-cover" />
      <span className="bg-background/90 absolute start-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-medium tabular-nums shadow-xs">
        {index + 1}
      </span>
      <span
        aria-hidden
        className="bg-background/90 text-muted-foreground absolute start-1/2 top-1.5 -translate-x-1/2 rounded-full p-0.5 opacity-0 shadow-xs transition-opacity group-hover:opacity-100 rtl:translate-x-1/2"
      >
        <GripVertical className="size-3.5 rotate-90" />
      </span>
      <button
        type="button"
        // Keep clicks and key presses on the button from starting a drag.
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onClick={onRemove}
        disabled={disabled}
        aria-label={t("removeFile", { name: item.name })}
        className="bg-background/90 hover:text-destructive absolute end-1.5 top-1.5 rounded-full p-1 shadow-xs transition-colors"
      >
        <X className="size-3.5" />
      </button>
      <span className="bg-background/85 absolute inset-x-0 bottom-0 truncate px-2 py-0.5 text-[11px]">
        <bdi>{item.name}</bdi>
      </span>
    </li>
  )
}

/**
 * Grid of picked files that can be reordered by dragging, or from the keyboard
 * (focus a tile, Space to lift, arrow keys to move, Space to drop).
 */
export function SortableFileGrid({
  items,
  onChange,
  onRemove,
  disabled,
}: {
  items: DropzoneItem[]
  onChange: (items: DropzoneItem[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
}) {
  const t = useTranslations("Inputs.dropzone")
  const sensors = useSensors(
    // A few pixels of movement before a drag starts, so a click stays a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const nameOf = (id: string | number) => items.find((item) => item.id === id)?.name ?? ""
  const positionOf = (id: string | number) => items.findIndex((item) => item.id === id) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) => t("announce.start", { name: nameOf(active.id), position: positionOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? t("announce.over", { name: nameOf(active.id), position: positionOf(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over ? t("announce.end", { name: nameOf(active.id), position: positionOf(over.id) }) : undefined,
    onDragCancel: ({ active }) => t("announce.cancel", { name: nameOf(active.id) }),
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    onChange(arrayMove(items, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t("announce.instructions") } }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
          {items.map((item, index) => (
            <SortableTile key={item.id} item={item} index={index} disabled={disabled} onRemove={() => onRemove(item.id)} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
