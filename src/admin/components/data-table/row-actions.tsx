"use client"

import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu"

/**
 * "…" menu at the end of a table row with Edit and Delete.
 *
 * @example <RowActions label={row.name_en} editHref={`${PATH}/${row.id}/edit`} onDelete={() => setToDelete([row])} />
 */
export function RowActions({
  label,
  editHref,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  /** Names the row for screen readers, e.g. "Actions: Ticketing". */
  label: string
  editHref: string
  onDelete: () => void
  editLabel: string
  deleteLabel: string
}) {
  const t = useTranslations("DataTable")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="data-popup-open:bg-muted"
            aria-label={`${t("actions")}: ${label}`}
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href={editHref} />}>
          <Pencil />
          {editLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
