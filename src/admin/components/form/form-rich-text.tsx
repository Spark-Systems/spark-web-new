"use client"

import type { FieldValues } from "react-hook-form"

import { RichTextEditor, type RichTextEditorProps } from "@admin/components/inputs/rich-text-editor"
import { FormField, type FormFieldBaseProps } from "./form-field"

/**
 * Tiptap rich text editor bound to react-hook-form (the field value is HTML).
 *
 * @example <FormRichText control={form.control} name="descriptionEn" label="Description" maxLength={300} />
 */
export function FormRichText<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...editorProps
}: FormFieldBaseProps<T> &
  Omit<
    RichTextEditorProps,
    "value" | "onChange" | "onBlur" | "id" | "invalid" | "aria-describedby" | "aria-labelledby"
  >) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, labelId, describedBy, invalid }) => (
        <RichTextEditor
          {...editorProps}
          id={id}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={invalid}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
        />
      )}
    />
  )
}
