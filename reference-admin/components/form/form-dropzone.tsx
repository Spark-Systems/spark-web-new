"use client"

import type { FieldValues } from "react-hook-form"

import { FileDropzone, type FileDropzoneProps } from "@/components/inputs/file-dropzone"
import { FormField, type FormFieldBaseProps } from "./form-field"

/**
 * File dropzone bound to react-hook-form (the field value is DropzoneItem[]).
 *
 * @example <FormDropzone control={form.control} name="icon" label="Icon" formats={["svg"]} maxSize={200 * 1024} />
 * @example <FormDropzone control={form.control} name="photos" label="Photos" formats={["jpg", "png", "webp"]} multiple maxFiles={20} />
 */
export function FormDropzone<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...dropzoneProps
}: FormFieldBaseProps<T> &
  Omit<FileDropzoneProps, "value" | "onChange" | "onBlur" | "id" | "invalid" | "aria-describedby">) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => (
        <FileDropzone
          {...dropzoneProps}
          id={id}
          value={field.value ?? []}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={invalid}
          aria-describedby={describedBy}
        />
      )}
    />
  )
}
