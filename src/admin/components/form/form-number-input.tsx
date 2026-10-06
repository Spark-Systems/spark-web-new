"use client"

import type { FieldValues } from "react-hook-form"

import { NumberInput, type NumberInputProps } from "@admin/components/inputs/number-input"
import { FormField, type FormFieldBaseProps } from "./form-field"

/**
 * Number input with − / + steppers bound to react-hook-form (the field value is number | null).
 *
 * @example <FormNumberInput control={form.control} name="order" label="Order" min={-1000} max={1000} />
 */
export function FormNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...numberProps
}: FormFieldBaseProps<T> &
  Omit<NumberInputProps, "value" | "onChange" | "onBlur" | "id" | "name" | "invalid" | "aria-describedby">) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => (
        <NumberInput
          {...numberProps}
          id={id}
          name={field.name}
          value={field.value ?? null}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={invalid}
          aria-describedby={describedBy}
        />
      )}
    />
  )
}
