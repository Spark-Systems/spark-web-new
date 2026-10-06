"use client"

import type { FieldValues } from "react-hook-form"

import { CodeEditor, type CodeEditorProps } from "@admin/components/inputs/code-editor"
import { FormField, type FormFieldBaseProps } from "./form-field"

/**
 * Code editor (CodeMirror, HTML/JS highlighting) bound to react-hook-form.
 *
 * @example <FormCodeEditor control={form.control} name="seoScripts" label="SEO scripts" placeholder="<script>…</script>" />
 */
export function FormCodeEditor<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...editorProps
}: FormFieldBaseProps<T> &
  Omit<CodeEditorProps, "value" | "onChange" | "onBlur" | "id" | "invalid" | "aria-describedby" | "aria-labelledby">) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, labelId, describedBy, invalid }) => (
        <CodeEditor
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
