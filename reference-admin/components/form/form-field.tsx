"use client"

import { useId } from "react"
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

export interface FormFieldBaseProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  required?: boolean
  className?: string
}

export interface FormFieldControlProps {
  id: string
  labelId: string
  /** Points at the description and error, for aria-describedby. */
  describedBy: string | undefined
  invalid: boolean
}

/**
 * Shared shell for every form field: label, control, description and error,
 * wired to react-hook-form and to each other for screen readers.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  render,
}: FormFieldBaseProps<T> & {
  render: (
    field: ControllerRenderProps<T, FieldPath<T>>,
    control: FormFieldControlProps,
    fieldState: ControllerFieldState
  ) => React.ReactNode
}) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const invalid = fieldState.invalid
        const describedBy =
          [description && `${id}-description`, invalid && `${id}-error`].filter(Boolean).join(" ") || undefined

        return (
          <Field data-invalid={invalid} className={className}>
            <FieldLabel id={`${id}-label`} htmlFor={id}>
              {label}
              {required && (
                <span aria-hidden className="text-primary">
                  *
                </span>
              )}
            </FieldLabel>
            {render(field, { id, labelId: `${id}-label`, describedBy, invalid }, fieldState)}
            {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
            <FieldError id={`${id}-error`} errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
