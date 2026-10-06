"use client"

import type { FieldValues } from "react-hook-form"

import { FormField, type FormFieldBaseProps } from "@admin/components/form/form-field"
import { FileDropzone, type DropzoneItem, type FileFormat } from "@admin/components/inputs/file-dropzone"
import { imageUrl, isPendingImage, type ImageValue } from "./images"

/** Matches the server's limit (Vercel caps request bodies at 4.5 MB). */
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024
const PHOTO_FORMATS: FileFormat[] = ["jpeg", "jpg", "png", "webp", "gif"]

const fileName = (url: string) => decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "image")

function toItems(value: ImageValue, id: string): DropzoneItem[] {
  if (!value) return []
  if (isPendingImage(value)) {
    return [{ id, url: value.preview, name: value.file.name, size: value.file.size, type: value.file.type, file: value.file }]
  }
  const url = imageUrl(value) ?? ""
  return [{ id, url, name: fileName(url), type: "image/*" }]
}

/**
 * One picture, bound to react-hook-form. The value is the stored picture (or
 * an external URL); a newly picked file stays in the form as a pending
 * picture until save (see uploadPendingImages). Photos are converted to WebP
 * on upload; `svg` allows SVG logos too.
 *
 * @example <FormImage control={control} name="image" label="Picture" required />
 */
export function FormImage<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  svg = false,
}: FormFieldBaseProps<T> & { svg?: boolean }) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => {
        const value = (field.value ?? null) as ImageValue
        return (
          <FileDropzone
            id={id}
            value={toItems(value, `${name}-image`)}
            onChange={(items) => {
              const [item] = items
              if (!item) field.onChange(null)
              else if (item.file) field.onChange({ pending: true, file: item.file, preview: item.url })
            }}
            onBlur={field.onBlur}
            formats={svg ? [...PHOTO_FORMATS, "svg"] : PHOTO_FORMATS}
            maxSize={IMAGE_MAX_BYTES}
            invalid={invalid}
            aria-describedby={describedBy}
          />
        )
      }}
    />
  )
}
