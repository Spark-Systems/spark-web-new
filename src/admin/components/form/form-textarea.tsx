"use client"

import type { FieldValues } from "react-hook-form"

import { Textarea } from "@admin/components/ui/textarea"
import { FormField, type FormFieldBaseProps } from "./form-field"

type NativeTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "id"
>

/**
 * Plain multi-line text bound to react-hook-form. With `maxLength` it shows a
 * "12 / 500" count under the box.
 *
 * @example <FormTextarea control={form.control} name="summaryEn" label="English description" dir="ltr" maxLength={500} />
 */
export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  maxLength,
  rows = 4,
  ...textareaProps
}: FormFieldBaseProps<T> & NativeTextareaProps) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => {
        const value: string = field.value ?? ""
        return (
          <div className="flex flex-col gap-1">
            <Textarea
              {...textareaProps}
              {...field}
              value={value}
              id={id}
              rows={rows}
              maxLength={maxLength}
              className="min-h-24"
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              aria-required={required || undefined}
            />
            {maxLength !== undefined && (
              // Numbers read "12 / 500" in both languages.
              <span dir="ltr" className="text-muted-foreground self-end text-xs tabular-nums">
                {value.length} / {maxLength}
              </span>
            )}
          </div>
        )
      }}
    />
  )
}
