"use client"

import { useId } from "react"
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Checkbox } from "@admin/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@admin/components/ui/field"

/**
 * Checkbox bound to react-hook-form (the field value is a boolean), with the
 * label and optional description beside it.
 *
 * @example <FormCheckbox control={form.control} name="useSsl" label="Use SSL" description="Encrypt the connection" />
 */
export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  disabled?: boolean
  className?: string
}) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid} className={className}>
          <Checkbox
            id={id}
            name={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            onBlur={field.onBlur}
            disabled={disabled}
            aria-invalid={fieldState.invalid || undefined}
            aria-describedby={description ? `${id}-description` : undefined}
          />
          <FieldContent>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
    />
  )
}
