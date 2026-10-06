"use client"

import { useTranslations } from "next-intl"

import { TableThumbnail } from "@admin/components/data-table/table-thumbnail"
import { StatusBadge } from "@admin/components/status-badge"
import type { UploadedImage } from "@admin/lib/api/types"
import { Icon } from "@/components/ui/icon"
import type { IconName } from "@/types/content"

/** Table cell content shared by the list tables. */

export function YesNo({ value }: { value: boolean }) {
  const t = useTranslations("Common")
  return value ? <StatusBadge tone="success">{t("yes")}</StatusBadge> : <StatusBadge tone="neutral">{t("no")}</StatusBadge>
}

/** Name with its icon chip and the URL slug underneath. */
export function NameCell({ name, icon, slug }: { name: string; icon?: IconName; slug?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {icon && (
        <span className="bg-accent text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="font-medium">{name}</span>
        {slug && (
          <span dir="ltr" className="text-muted-foreground text-xs">
            /{slug}
          </span>
        )}
      </span>
    </span>
  )
}

export function PictureCell({ image, alt, logo }: { image: UploadedImage | null | undefined; alt: string; logo?: boolean }) {
  const t = useTranslations("Common")
  return (
    <TableThumbnail
      src={image?.src}
      alt={alt}
      emptyLabel={t("noPicture")}
      // Logos are shown whole on a checkered-ish neutral backdrop rather than cropped.
      className={logo ? "bg-muted object-contain p-1.5 dark:bg-neutral-700" : undefined}
    />
  )
}
