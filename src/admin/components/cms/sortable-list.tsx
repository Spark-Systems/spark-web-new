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
  type Modifier,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS, type Transform } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@admin/lib/utils"

/** Items only travel up and down. */
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 })

/**
 * A vertical list whose items are reordered by dragging their handle, or from
 * the keyboard (focus the handle, Space to lift, arrow keys to move, Space to drop).
 * Render each item with dnd-kit's `useSortable`, `sortableStyle` and a `DragHandle`.
 */
export function SortableList({
  ids,
  onMove,
  children,
}: {
  /** Stable id of each item, in order. */
  ids: string[]
  onMove: (from: number, to: number) => void
  children: React.ReactNode
}) {
  const t = useTranslations("Repeater.drag")
  const sensors = useSensors(
    // A few pixels of movement before a drag starts, so a click stays a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const positionOf = (id: string | number) => ids.indexOf(String(id)) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) => t("start", { position: positionOf(active.id) }),
    onDragOver: ({ over }) => (over ? t("over", { position: positionOf(over.id) }) : undefined),
    onDragEnd: ({ over }) => (over ? t("end", { position: positionOf(over.id) }) : undefined),
    onDragCancel: () => t("cancel"),
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[verticalOnly]}
      onDragEnd={onDragEnd}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t("instructions") } }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

/** Inline style that moves an item of a SortableList while it's dragged. */
export const sortableStyle = (transform: Transform | null, transition: string | undefined): React.CSSProperties => ({
  transform: CSS.Translate.toString(transform),
  transition,
})

/** The grip an item is dragged by; spread useSortable's attributes and listeners onto it. */
export function DragHandle({ className, disabled, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted flex size-7 shrink-0 touch-none items-center justify-center rounded-md outline-none",
        "focus-visible:ring-ring focus-visible:ring-2",
        disabled ? "cursor-default opacity-40" : "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      <GripVertical className="size-4" />
    </button>
  )
}

/** Classes for an item while it's being dragged. */
export const draggingClass = "ring-primary relative z-10 shadow-lg ring-2"
