import type { UploadedImage } from "@admin/lib/api/types"
import { uploadsApi } from "@admin/lib/api/services/uploads"

/**
 * A picture picked in a form but not uploaded yet. Forms keep these until
 * save, then `uploadPendingImages` swaps each for the stored picture.
 */
export interface PendingImage {
  pending: true
  file: File
  /** Object URL for the preview. */
  preview: string
}

/** An image field's value: stored picture, external URL, picked file, or empty. */
export type ImageValue = UploadedImage | string | PendingImage | null

export const isPendingImage = (value: unknown): value is PendingImage =>
  typeof value === "object" && value !== null && (value as PendingImage).pending === true && "file" in value

/** Stands in for not-yet-uploaded pictures while validating, so they pass as "has a picture". */
const PLACEHOLDER: UploadedImage = { src: "/pending-upload", width: 1, height: 1 }

/** Deep copy of `value` with every pending picture replaced by `replace(picture)`. */
function mapPending(value: unknown, replace: (image: PendingImage) => unknown): unknown {
  if (isPendingImage(value)) return replace(value)
  if (Array.isArray(value)) return value.map((item) => mapPending(item, replace))
  if (value && typeof value === "object" && !(value instanceof Blob)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapPending(item, replace)]))
  }
  return value
}

/** The form values as validation should see them: pending pictures count as present. */
export const withPlaceholderImages = <T>(values: T): T => mapPending(values, () => PLACEHOLDER) as T

/**
 * Uploads every pending picture in `values` (each file once, even if used in
 * several places) into `folder` and returns the values with the stored pictures.
 */
export async function uploadPendingImages<T>(values: T, folder: string): Promise<T> {
  const files = new Map<File, Promise<UploadedImage>>()
  mapPending(values, (image) => {
    if (!files.has(image.file)) {
      files.set(
        image.file,
        uploadsApi.upload(image.file, folder).then((result) => {
          const stored: Partial<typeof result> = { ...result }
          delete stored.url // same as src; not part of a stored picture
          return stored as UploadedImage
        }),
      )
    }
    return image
  })
  const uploaded = new Map<File, UploadedImage>()
  await Promise.all([...files].map(async ([file, upload]) => uploaded.set(file, await upload)))
  return mapPending(values, (image) => uploaded.get(image.file)) as T
}

/** The URL to show for an image value. */
export function imageUrl(value: ImageValue | undefined): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  if (isPendingImage(value)) return value.preview
  return value.src
}
