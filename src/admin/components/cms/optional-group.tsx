"use client"

/* eslint-disable @typescript-eslint/no-explicit-any -- binds to any form at a dotted path */

import { useController, type Control, type FieldValues } from "react-hook-form"

import { Checkbox } from "@admin/components/ui/checkbox"
import { Label } from "@admin/components/ui/label"

/**
 * An optional block (a headline figure, a testimonial…): a checkbox that adds
 * it (filled from `template`) or removes it, and its fields while it's on.
 *
 * @example <OptionalGroup control={control} name="detail.inUse.stat" label="Show a headline figure" template={() => ({ value: 0, label: "" })}>…</OptionalGroup>
 */
export function OptionalGroup<T extends FieldValues>({
  control,
  name,
  label,
  description,
  template,
  children,
}: {
  control: Control<T>
  name: string
  label: string
  description?: string
  template: () => unknown
  children: React.ReactNode
}) {
  const { field } = useController({ control: control as unknown as Control<any, any, any>, name })
  const on = field.value !== undefined && field.value !== null

  return (
    <div className="flex flex-col gap-4 lg:col-span-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`${name}-toggle`}
          checked={on}
          onCheckedChange={(checked) => field.onChange(checked ? template() : undefined)}
        />
        <div className="grid gap-1">
          <Label htmlFor={`${name}-toggle`}>{label}</Label>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      </div>
      {on && <div className="grid gap-6 border-s-2 ps-4 lg:grid-cols-2">{children}</div>}
    </div>
  )
}
