"use client"

import { FileIcon, FilePlus, ImagePlus, RefreshCw, Trash2, UploadCloud, X } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { ErrorCode, useDropzone, type Accept, type FileRejection } from "react-dropzone"

import { Button } from "@admin/components/ui/button"
import { cn } from "@admin/lib/utils"
import { SortableFileGrid } from "./sortable-file-grid"

/** A file shown in the dropzone: either newly picked (has `file`) or already stored (just `url`). */
export interface DropzoneItem {
  id: string
  /** Object URL for a new file, or the stored URL for an existing one. */
  url: string
  name: string
  size?: number
  type?: string
  /** Present only for files picked in this session (still to be uploaded). */
  file?: File
}

const FORMATS = {
  svg: { "image/svg+xml": [".svg"] },
  png: { "image/png": [".png"] },
  jpg: { "image/jpeg": [".jpg"] },
  jpeg: { "image/jpeg": [".jpeg"] },
  webp: { "image/webp": [".webp"] },
  gif: { "image/gif": [".gif"] },
  ico: { "image/x-icon": [".ico"], "image/vnd.microsoft.icon": [".ico"] },
  pdf: { "application/pdf": [".pdf"] },
  doc: { "application/msword": [".doc"] },
  docx: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
  xlsx: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
  zip: { "application/zip": [".zip"] },
  mp4: { "video/mp4": [".mp4"] },
} satisfies Record<string, Accept>

export type FileFormat = keyof typeof FORMATS

/** Combines accept maps, concatenating extensions when formats share a MIME type (jpg + jpeg). */
function mergeAccept(maps: Accept[]): Accept {
  const merged: Record<string, string[]> = {}
  for (const map of maps) {
    for (const [mime, extensions] of Object.entries(map)) {
      merged[mime] = [...new Set([...(merged[mime] ?? []), ...extensions])]
    }
  }
  return merged
}

export interface FileDropzoneProps {
  value: DropzoneItem[]
  onChange: (items: DropzoneItem[]) => void
  onBlur?: () => void
  /** Allowed formats, e.g. ["svg"] or ["png", "jpg", "webp"]. Omit to allow any file. */
  formats?: FileFormat[]
  /** Raw react-dropzone `accept` map; overrides `formats` when both are given. */
  accept?: Accept
  /** Largest allowed file, in bytes. */
  maxSize?: number
  /** Allow several files. When false (default) a new file replaces the current one. */
  multiple?: boolean
  /** Cap on the number of files when `multiple`. */
  maxFiles?: number
  /** With `multiple`, show the files as a gallery that can be reordered by dragging. */
  sortable?: boolean
  id?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-describedby"?: string
}

let counter = 0
const newId = () => `file-${Date.now().toString(36)}-${(counter++).toString(36)}`

const isImage = (item: DropzoneItem) =>
  item.type?.startsWith("image/") || /\.(svg|png|jpe?g|webp|gif|ico|avif)$/i.test(item.name || item.url)

/** Formats a byte count for people, e.g. "2 MB", in the current locale. */
export function useFileSize() {
  const format = useFormatter()
  return (bytes: number) =>
    bytes >= 1024 * 1024
      ? format.number(bytes / (1024 * 1024), { style: "unit", unit: "megabyte", maximumFractionDigits: 1 })
      : bytes >= 1024
        ? format.number(bytes / 1024, { style: "unit", unit: "kilobyte", maximumFractionDigits: 0 })
        : format.number(bytes, { style: "unit", unit: "byte", unitDisplay: "narrow" })
}

function Preview({ item, className, small }: { item: DropzoneItem; className?: string; small?: boolean }) {
  return isImage(item) ? (
    // Plain <img>: previews are blob:/data: URLs; next/image can't optimize those.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.url} alt="" className={cn("max-h-full max-w-full object-contain", className)} />
  ) : (
    <FileIcon className={cn("text-muted-foreground", small ? "size-3.5" : "size-8")} />
  )
}

/**
 * A chosen picture, shown large: a 250×250 tile (drop another file on it to
 * replace it) with its name, size and pixel size beside it (stacked when the
 * column is narrow). Empty fields use the one-line input instead.
 */
function PictureDrop({
  item,
  rootProps,
  inputProps,
  isDragActive,
  isDragReject,
  invalid,
  unavailable,
  hint,
  onReplace,
  onRemove,
}: {
  item: DropzoneItem
  rootProps: React.HTMLAttributes<HTMLDivElement>
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
  isDragActive: boolean
  isDragReject: boolean
  invalid?: boolean
  unavailable?: boolean
  hint: string
  onReplace: () => void
  onRemove: () => void
}) {
  const t = useTranslations("Inputs.dropzone")
  const fileSize = useFileSize()
  // Natural size of the shown picture, read once it loads.
  const [natural, setNatural] = useState<{ url: string; width: number; height: number } | null>(null)
  const dimensions = natural?.url === item.url ? `${natural.width} × ${natural.height}` : null
  // Buttons inside the tile must not also trigger the tile's own click (which opens the picker).
  const stop = (event: React.SyntheticEvent) => event.stopPropagation()

  return (
    <div className="@container">
      <div className="flex flex-col gap-3 @sm:flex-row @sm:items-start">
        <div
          {...rootProps}
          className={cn(
            "group bg-muted/60 relative flex aspect-square w-[250px] max-w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border outline-none transition-[border-color,box-shadow,background-color]",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            isDragActive && "border-primary bg-accent ring-primary/20 ring-3",
            (isDragReject || invalid) && "border-destructive ring-destructive/20 dark:ring-destructive/40 ring-3",
            unavailable && "pointer-events-none cursor-not-allowed opacity-50"
          )}
        >
          <input {...inputProps} />
          {/* Plain <img>: previews are blob:/data: URLs; next/image can't optimize those. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt=""
            draggable={false}
            onLoad={(event) =>
              setNatural({ url: item.url, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
            }
            className="size-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* Hover / drag overlay with the quick actions. */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-sm font-medium text-white transition-opacity",
              isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
            )}
          >
            {isDragActive ? (
              <>
                <UploadCloud className="size-7" />
                {t("dropToReplace")}
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(event) => {
                    stop(event)
                    onReplace()
                  }}
                  onKeyDown={stop}
                >
                  <RefreshCw data-icon="inline-start" />
                  {t("replaceShort")}
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  onClick={(event) => {
                    stop(event)
                    onRemove()
                  }}
                  onKeyDown={stop}
                  aria-label={t("removeFile", { name: item.name })}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 @sm:pt-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            {/* <bdi> keeps a Latin file name intact in Arabic without changing its alignment. */}
            <span className="text-sm font-medium break-all">
              <bdi>{item.name}</bdi>
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {[item.size !== undefined && fileSize(item.size), dimensions, item.file && t("notSaved")].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onReplace} disabled={unavailable}>
              <RefreshCw data-icon="inline-start" />
              {t("replaceShort")}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={unavailable} className="hover:text-destructive">
              <Trash2 data-icon="inline-start" />
              {t("remove")}
            </Button>
          </div>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * Drag-and-drop file picker with previews (react-dropzone). Supports a format
 * allow-list, a size limit, and single (replace) or multiple (append) mode.
 * Controlled: new picks arrive as items carrying the File, to upload on save.
 */
export function FileDropzone({
  value,
  onChange,
  onBlur,
  formats,
  accept,
  maxSize,
  multiple = false,
  maxFiles,
  sortable,
  id,
  disabled,
  invalid,
  className,
  "aria-describedby": describedBy,
}: FileDropzoneProps) {
  const t = useTranslations("Inputs.dropzone")
  const fileSize = useFileSize()
  const [errors, setErrors] = useState<string[]>([])

  const acceptMap = accept ?? (formats ? mergeAccept(formats.map((f) => FORMATS[f])) : undefined)
  const formatList = formats?.map((f) => f.toUpperCase()).join(", ")
  const remaining = multiple && maxFiles ? Math.max(maxFiles - value.length, 0) : undefined

  // Free object URLs we created once their item leaves the value (removed,
  // replaced, or swapped for the stored URL after saving) and on unmount.
  const ownedUrls = useRef(new Set<string>())
  useEffect(() => {
    const live = new Set(value.map((item) => item.url))
    for (const url of ownedUrls.current) {
      if (!live.has(url)) {
        URL.revokeObjectURL(url)
        ownedUrls.current.delete(url)
      }
    }
  }, [value])
  useEffect(() => {
    const urls = ownedUrls.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const describeRejection = ({ file, errors: fileErrors }: FileRejection) => {
    const code = fileErrors[0]?.code
    if (code === ErrorCode.FileTooLarge && maxSize) return t("errors.tooLarge", { name: file.name, size: fileSize(maxSize) })
    if (code === ErrorCode.FileInvalidType) return t("errors.invalidType", { name: file.name, formats: formatList ?? "" })
    if (code === ErrorCode.TooManyFiles) return t("errors.tooMany", { max: maxFiles ?? 1 })
    return t("errors.generic", { name: file.name })
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    accept: acceptMap,
    maxSize,
    multiple,
    maxFiles: multiple ? remaining : 1,
    disabled: disabled || remaining === 0,
    onDrop: (accepted, rejections) => {
      // A single-mode drop of several files: keep the first, don't reject them all.
      const files = multiple ? accepted : accepted.slice(0, 1)
      const tooMany = rejections.some((r) => r.errors[0]?.code === ErrorCode.TooManyFiles)
      setErrors(
        tooMany
          ? [t("errors.tooMany", { max: maxFiles ?? 1 })]
          : rejections.map(describeRejection)
      )
      if (files.length === 0) return

      const items = files.map((file) => {
        const url = URL.createObjectURL(file)
        ownedUrls.current.add(url)
        return { id: newId(), url, name: file.name, size: file.size, type: file.type, file }
      })
      onChange(multiple ? [...value, ...items] : items)
      onBlur?.()
    },
  })

  const remove = (itemId: string) => {
    onChange(value.filter((item) => item.id !== itemId))
    setErrors([])
    onBlur?.()
  }

  const hint = [formatList, maxSize && t("upTo", { size: fileSize(maxSize) }), remaining !== undefined && maxFiles && t("filesLeft", { count: remaining, max: maxFiles })]
    .filter(Boolean)
    .join(" · ")

  const unavailable = disabled || remaining === 0
  // The button says "Add image" when only image formats are allowed, "Add file" otherwise.
  const onlyImages = acceptMap !== undefined && Object.keys(acceptMap).every((mime) => mime.startsWith("image/"))
  const AddIcon = onlyImages ? ImagePlus : FilePlus

  // Looks and sizes like the other text inputs; the whole field is the drop target.
  const fieldClass = cn(
    "border-input dark:bg-input/30 flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border bg-transparent ps-2.5 pe-1 text-sm transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
    isDragActive && "border-primary bg-accent ring-primary/20 ring-3",
    (isDragReject || invalid) && "border-destructive ring-destructive/20 dark:ring-destructive/40 ring-3",
    unavailable && "bg-input/50 pointer-events-none cursor-not-allowed opacity-50"
  )

  const single = !multiple ? value[0] : undefined
  const errorList = errors.length > 0 && (
    <ul role="alert" className="text-destructive flex flex-col gap-0.5 text-xs">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  )

  // A chosen picture shows large; an empty picture field is the one-line input below.
  if (!multiple && onlyImages && single) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <PictureDrop
          item={single}
          rootProps={getRootProps()}
          inputProps={getInputProps({ id, "aria-describedby": describedBy })}
          isDragActive={isDragActive}
          isDragReject={isDragReject}
          invalid={invalid}
          unavailable={unavailable}
          hint={hint}
          onReplace={open}
          onRemove={() => remove(single.id)}
        />
        {errorList}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {single ? (
        // A picked file shows in the field; dropping another file on it replaces it.
        <div
          {...getRootProps({
            onClick: (event) => event.stopPropagation(),
            className: cn(fieldClass, "cursor-default"),
          })}
        >
          <input {...getInputProps({ id, "aria-describedby": describedBy })} />
          <span className="bg-muted flex size-6 shrink-0 items-center justify-center overflow-hidden rounded">
            <Preview item={single} small className="size-full object-cover" />
          </span>
          {/* <bdi> keeps a Latin file name intact in Arabic without changing its alignment. */}
          <span className="min-w-0 flex-1 truncate">
            <bdi>{isDragActive ? t("dropHere") : single.name}</bdi>
          </span>
          {single.size !== undefined && !isDragActive && (
            <span className="text-muted-foreground hidden shrink-0 text-xs tabular-nums sm:inline">{fileSize(single.size)}</span>
          )}
          <Button type="button" variant="ghost" size="icon-xs" onClick={open} disabled={disabled} aria-label={t("replace")}>
            <RefreshCw />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => remove(single.id)}
            disabled={disabled}
            aria-label={t("removeFile", { name: single.name })}
            className="hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      ) : (
        <div {...getRootProps({ className: cn(fieldClass, "cursor-pointer hover:border-ring/60") })}>
          <input {...getInputProps({ id, "aria-describedby": describedBy })} />
          <span className={cn("min-w-0 flex-1 truncate", isDragActive ? "text-primary" : "text-muted-foreground")}>
            {isDragActive ? t("dropHere") : multiple ? t("titleMultiple") : t("title")}
          </span>
          {/* Looks like a button; the whole field opens the picker. */}
          <span
            aria-hidden
            className="bg-primary text-primary-foreground flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium"
          >
            <AddIcon className="size-3.5" />
            {t(onlyImages ? (multiple ? "addImages" : "addImage") : multiple ? "addFiles" : "addFile")}
          </span>
        </div>
      )}

      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}

      {multiple && sortable && value.length > 0 && (
        <SortableFileGrid items={value} onChange={onChange} onRemove={remove} disabled={disabled} />
      )}

      {multiple && !sortable && value.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
          {value.map((item) => (
            <li key={item.id} className="group bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border p-2">
              <Preview item={item} />
              <span className="bg-background/85 absolute inset-x-0 bottom-0 truncate px-1.5 py-0.5 text-[11px]">
                <bdi>{item.name}</bdi>
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={disabled}
                aria-label={t("removeFile", { name: item.name })}
                className="bg-background/90 hover:text-destructive absolute end-1 top-1 rounded-full p-1 shadow-xs transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {errorList}
    </div>
  )
}
