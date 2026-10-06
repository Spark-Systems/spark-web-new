"use client"

import type { FieldValues } from "react-hook-form"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, type FormFieldBaseProps } from "./form-field"

export interface SelectOption {
  value: string
  /** Shown in the trigger once picked (and in the list unless `itemLabel` is set). */
  label: string
  /** Text in the open list when it should differ from `label`, e.g. a short name under its group. */
  itemLabel?: string
  /** Indent level in the list, e.g. 1 for a subcategory under its main category. */
  level?: number
  disabled?: boolean
}

/**
 * shadcn Select bound to react-hook-form (the field value is the option's value, or "" when empty).
 *
 * @example <FormSelect control={form.control} name="section" label="Section" options={sectionOptions} placeholder="Choose…" />
 * @example <FormSelect control={form.control} name="parentId" label="Parent" options={parents} emptyOption="None" />
 */
export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  options,
  placeholder,
  emptyOption,
  disabled,
}: FormFieldBaseProps<T> & {
  options: SelectOption[]
  placeholder?: string
  /** Label for a first item that clears the selection (the field value becomes ""). */
  emptyOption?: string
  disabled?: boolean
}) {
  const items: (Omit<SelectOption, "value"> & { value: string | null })[] =
    emptyOption !== undefined ? [{ value: null, label: emptyOption }, ...options] : options

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => (
        <Select
          // `items` lets the trigger show the selected option's label, not its raw value.
          items={items}
          value={field.value || null}
          onValueChange={(value) => field.onChange(value ?? "")}
          disabled={disabled}
          name={field.name}
        >
          <SelectTrigger
            id={id}
            className="w-full"
            onBlur={field.onBlur}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {items.map((option) => (
              <SelectItem
                key={option.value ?? ""}
                value={option.value}
                disabled={option.disabled}
                style={option.level ? { paddingInlineStart: `${0.375 + option.level * 1}rem` } : undefined}
              >
                {option.itemLabel ?? option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}
