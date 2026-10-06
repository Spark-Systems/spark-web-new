"use client"

import type { FieldValues } from "react-hook-form"

import { PasswordInput } from "@/components/inputs/password-input"
import { Input } from "@/components/ui/input"
import { FormField, type FormFieldBaseProps } from "./form-field"

type NativeInputProps = Omit<
  React.ComponentProps<"input">,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "id"
>

/**
 * Text input bound to react-hook-form. `type="password"` adds a show/hide toggle.
 *
 * @example <FormInput control={form.control} name="nameEn" label="English name" dir="ltr" />
 */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  type,
  ...inputProps
}: FormFieldBaseProps<T> & NativeInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => {
        const props = {
          ...inputProps,
          ...field,
          value: field.value ?? "",
          id,
          "aria-invalid": invalid || undefined,
          "aria-describedby": describedBy,
          "aria-required": required || undefined,
        }
        return type === "password" ? <PasswordInput {...props} /> : <Input type={type} {...props} />
      }}
    />
  )
}
