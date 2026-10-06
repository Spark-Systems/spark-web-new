import { ImageOff } from "lucide-react"

import { cn } from "@admin/lib/utils"

/**
 * Small picture preview for a table cell, or a dashed placeholder when there's none.
 *
 * @example <TableThumbnail src={row.image_url} alt={row.name_en} emptyLabel="No picture" />
 */
export function TableThumbnail({
  src,
  alt,
  emptyLabel,
  className,
}: {
  src: string | null | undefined
  alt: string
  /** Tooltip and screen-reader text for the placeholder. */
  emptyLabel: string
  className?: string
}) {
  if (!src) {
    return (
      <span
        title={emptyLabel}
        className={cn(
          "bg-muted text-muted-foreground flex h-10 w-24 items-center justify-center rounded-md border border-dashed",
          className
        )}
      >
        <ImageOff className="size-4" />
        <span className="sr-only">{emptyLabel}</span>
      </span>
    )
  }
  return (
    // Plain <img>: pictures may be data:/blob: or external URLs next/image can't optimize.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={cn("bg-muted h-10 w-24 rounded-md border object-cover", className)} />
  )
}
