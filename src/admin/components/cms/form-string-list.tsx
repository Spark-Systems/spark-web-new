"use client"

import { Plus, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { FieldValues } from "react-hook-form"

import { FormField, type FormFieldBaseProps } from "@admin/components/form/form-field"
import { Button } from "@admin/components/ui/button"
import { Input } from "@admin/components/ui/input"
import { Textarea } from "@admin/components/ui/textarea"
import { cn } from "@admin/lib/utils"
import { DragHandle, draggingClass, SortableList, sortableStyle } from "./sortable-list"

let lastId = 0
const newId = () => `entry-${++lastId}`

const moved = <V,>(list: V[], from: number, to: number) => {
  const next = [...list]
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}

type EntryProps = {
  id: string
  label: string
  canDrag: boolean
  canRemove: boolean
  onRemove: () => void
  children: React.ReactNode
}

function Entry({ id, label, canDrag, canRemove, onRemove, children }: EntryProps) {
  const t = useTranslations("Repeater")
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !canDrag })
  return (
    <div
      ref={setNodeRef}
      style={sortableStyle(transform, transition)}
      className={cn("bg-background flex items-start gap-1 rounded-lg", isDragging && draggingClass)}
    >
      <DragHandle ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={t("dragItem", { title: label })} disabled={!canDrag} className="mt-1" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hover:text-destructive mt-1"
        aria-label={t("remove")}
        disabled={!canRemove}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

/** The entries with drag-to-reorder. Entries are plain strings, so each gets a local id that follows it around. */
function Entries({
  list,
  onChange,
  min,
  renderEntry,
}: {
  list: string[]
  onChange: (next: string[]) => void
  min: number
  renderEntry: (index: number) => { label: string; content: React.ReactNode }
}) {
  const [ids, setIds] = useState(() => list.map(newId))
  // Entries added (or the value replaced) from outside: give new entries ids, drop extra ones.
  const safeIds = ids.length === list.length ? ids : list.map((_, i) => ids[i] ?? newId())
  if (safeIds !== ids) setIds(safeIds)

  return (
    <SortableList
      ids={safeIds}
      onMove={(from, to) => {
        setIds(moved(safeIds, from, to))
        onChange(moved(list, from, to))
      }}
    >
      {list.map((_, index) => {
        const { label, content } = renderEntry(index)
        return (
          <Entry
            key={safeIds[index]}
            id={safeIds[index]}
            label={label}
            canDrag={list.length > 1}
            canRemove={list.length > min}
            onRemove={() => {
              setIds(safeIds.filter((_, i) => i !== index))
              onChange(list.filter((_, i) => i !== index))
            }}
          >
            {content}
          </Entry>
        )
      })}
    </SortableList>
  )
}

/**
 * An ordered list of short texts (headline lines, paragraphs), one input per
 * entry, dragged by their handles to reorder, bound to react-hook-form (the value is a string[]).
 *
 * @example <FormStringList control={control} name="hero.titleLines" label="Headline lines" addLabel="Add line" max={6} />
 */
export function FormStringList<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  addLabel,
  multiline = false,
  min = 0,
  max,
  maxLength,
}: FormFieldBaseProps<T> & {
  addLabel: string
  /** Paragraph-sized entries (textareas). */
  multiline?: boolean
  min?: number
  max?: number
  maxLength?: number
}) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }, fieldState) => {
        const list: string[] = field.value ?? []
        // Errors on single entries arrive as an array alongside the list.
        const entryErrors = (Array.isArray(fieldState.error) ? fieldState.error : []) as ({ message?: string } | undefined)[]
        const set = (next: string[]) => field.onChange(next)
        return (
          <div className="flex flex-col gap-2">
            <Entries
              list={list}
              onChange={set}
              min={min}
              renderEntry={(index) => {
                const props = {
                  id: index === 0 ? id : undefined,
                  value: list[index],
                  maxLength,
                  onBlur: field.onBlur,
                  "aria-invalid": invalid || undefined,
                  "aria-describedby": describedBy,
                  "aria-label": `${label} ${index + 1}`,
                  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    set(list.map((v, i) => (i === index ? event.target.value : v))),
                }
                return {
                  label: list[index] || `${label} ${index + 1}`,
                  content: (
                    <>
                      {multiline ? <Textarea rows={3} {...props} /> : <Input {...props} />}
                      {entryErrors[index]?.message && <p className="text-destructive text-sm">{entryErrors[index]?.message}</p>}
                    </>
                  ),
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={max !== undefined && list.length >= max}
              onClick={() => set([...list, ""])}
            >
              <Plus data-icon="inline-start" />
              {addLabel}
            </Button>
          </div>
        )
      }}
    />
  )
}
