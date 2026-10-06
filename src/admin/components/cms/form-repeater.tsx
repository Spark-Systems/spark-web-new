"use client"

import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useFieldArray, useFormState, useWatch, type ArrayPath, type Control, type FieldValues } from "react-hook-form"

import { Button } from "@admin/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@admin/components/ui/collapsible"
import { FieldDescription, FieldError } from "@admin/components/ui/field"
import { cn } from "@admin/lib/utils"

/** Reads a nested form error by dotted path ("detail.features.items"). */
function errorAt(errors: unknown, path: string): { message?: string; root?: { message?: string } } | undefined {
  return path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], errors) as
    | { message?: string; root?: { message?: string } }
    | undefined
}

export interface FormRepeaterProps<T extends FieldValues> {
  control: Control<T>
  /** Path to an array of objects, e.g. "features.items". */
  name: ArrayPath<T>
  label: string
  description?: string
  /** Label of the add button, e.g. "Add feature". */
  addLabel: string
  /** A blank item for the add button. */
  newItem: () => unknown
  /** Heading of each item card (falls back to "#1", "#2"…). */
  itemTitle?: (item: Record<string, unknown>, index: number) => string | undefined
  min?: number
  max?: number
  /** The item's fields; `path` is the item's prefix, e.g. "features.items.2". */
  children: (path: string, index: number) => React.ReactNode
  className?: string
}

/**
 * An editable list of grouped fields (features, steps, stats…): add, remove,
 * reorder, and collapse each item. Items flow in a two-column grid like
 * FormSection; give a field `lg:col-span-2` to span both.
 *
 * @example
 * <FormRepeater control={control} name="steps" label="Steps" addLabel="Add step" newItem={() => ({ title: "", body: "" })}>
 *   {(path) => <FormInput control={control} name={`${path}.title`} label="Title" />}
 * </FormRepeater>
 */
export function FormRepeater<T extends FieldValues>({
  control,
  name,
  label,
  description,
  addLabel,
  newItem,
  itemTitle,
  min = 0,
  max,
  children,
  className,
}: FormRepeaterProps<T>) {
  const t = useTranslations("Repeater")
  const { fields, append, remove, move } = useFieldArray({ control, name })
  const values = (useWatch({ control, name: name as never }) ?? []) as Record<string, unknown>[]
  const { errors } = useFormState({ control, name: name as never })
  const listError = errorAt(errors, name)
  // Items start collapsed in long lists; ones added now start open.
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [addedIndex, setAddedIndex] = useState<number | null>(null)
  const startsOpen = fields.length <= 3

  return (
    <div className={cn("flex flex-col gap-3 lg:col-span-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-snug font-medium">{label}</span>
          {description && <FieldDescription>{description}</FieldDescription>}
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          {max ? t("countOf", { count: fields.length, max }) : t("count", { count: fields.length })}
        </span>
      </div>

      {fields.map((field, index) => {
        const path = `${name}.${index}`
        const isOpen = open[field.id] ?? (startsOpen || index === addedIndex)
        const title = itemTitle?.(values[index] ?? {}, index)?.trim() || t("item", { number: index + 1 })
        const hasError = Boolean(errorAt(errors, path))
        return (
          <Collapsible
            key={field.id}
            open={isOpen}
            onOpenChange={(next) => setOpen((state) => ({ ...state, [field.id]: next }))}
            className={cn("bg-card rounded-xl border", hasError && "border-destructive")}
          >
            <div className="flex items-center gap-1 p-2 ps-3">
              <CollapsibleTrigger
                render={<button type="button" />}
                className="flex min-w-0 flex-1 items-center gap-2 text-start text-sm font-medium"
              >
                <ChevronDown className={cn("text-muted-foreground size-4 shrink-0 transition-transform", !isOpen && "-rotate-90 rtl:rotate-90")} />
                <span className="text-muted-foreground tabular-nums">{index + 1}.</span>
                <span className="truncate">{title}</span>
                {hasError && <span className="bg-destructive size-2 shrink-0 rounded-full" aria-label={t("hasErrors")} />}
              </CollapsibleTrigger>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t("moveUp")} disabled={index === 0} onClick={() => move(index, index - 1)}>
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("moveDown")}
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("remove")}
                disabled={fields.length <= min}
                onClick={() => remove(index)}
                className="hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
            <CollapsibleContent>
              <div className="grid gap-5 border-t p-4 lg:grid-cols-2">{children(path, index)}</div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}

      {fields.length === 0 && (
        <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-center text-sm">{t("empty")}</p>
      )}

      <FieldError errors={[listError?.root ?? (listError?.message ? listError : undefined)]} />

      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={max !== undefined && fields.length >= max}
        onClick={() => {
          append(newItem() as never)
          setAddedIndex(fields.length)
        }}
      >
        <Plus data-icon="inline-start" />
        {addLabel}
      </Button>
    </div>
  )
}
