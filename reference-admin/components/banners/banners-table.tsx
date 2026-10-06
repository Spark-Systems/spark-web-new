"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DataTable, DataTableColumnHeader, dataTableColumnHelper } from "@/components/data-table/data-table"
import { DataTableFacetFilter } from "@/components/data-table/data-table-facet-filter"
import { TableThumbnail } from "@/components/data-table/table-thumbnail"
import { useDataTableQuery } from "@/components/data-table/use-data-table-query"
import { QueryError } from "@/components/query-error"
import { StatusBadge } from "@/components/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchAllRows } from "@/lib/api/fetch-all"
import { bannersApi, bannersQueries } from "@/lib/api/services/banners"
import { bannerSections, type InternalBanner } from "@/lib/api/types"
import { BANNERS_PATH } from "./banner-form"

const col = dataTableColumnHelper<InternalBanner>()
// Stable fallback: a fresh [] each render would make the table rebuild its rows.
const NO_ROWS: InternalBanner[] = []

export function BannersTable() {
  const t = useTranslations("Banners")
  const tTable = useTranslations("DataTable")
  const queryClient = useQueryClient()
  const [query, setQuery] = useDataTableQuery({ sort: { id: "created_at", desc: true } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(bannersQueries.list(query))
  const [toDelete, setToDelete] = useState<{ rows: InternalBanner[]; done?: () => void } | null>(null)

  const remove = useMutation({
    mutationFn: (rows: InternalBanner[]) => Promise.all(rows.map((row) => bannersApi.remove(row.id))),
    onSuccess: (_, rows) => {
      // Deleting every row on the last page would leave an empty page; step back.
      if (data && rows.length >= data.data.length && query.page > 1) setQuery({ page: query.page - 1 })
      queryClient.invalidateQueries({ queryKey: bannersQueries.all })
      toast.success(rows.length === 1 ? t("deleted") : t("bulkDeleted", { count: rows.length }))
      toDelete?.done?.()
      setToDelete(null)
    },
    onError: () => toast.error(t("deleteError")),
  })

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor("section", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.section")} />,
          cell: ({ row }) => (
            <Badge variant="outline" className="font-normal">
              {t(`sections.${row.original.section}`)}
            </Badge>
          ),
          meta: { className: "w-40" },
        }),
        col.accessor("name_en", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.nameEn")} />,
          cell: ({ row }) => (
            <span dir="ltr" className="font-medium">
              {row.original.name_en}
            </span>
          ),
        }),
        col.accessor("name_ar", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.nameAr")} />,
          cell: ({ row }) => <span dir="rtl">{row.original.name_ar}</span>,
        }),
        col.display({
          id: "picture",
          header: () => t("columns.picture"),
          cell: ({ row }) => <TableThumbnail src={row.original.image_url} alt={row.original.name_en} emptyLabel={t("noPicture")} />,
          meta: { className: "w-32" },
        }),
        col.accessor("no_image", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.noImage")} />,
          cell: ({ row }) =>
            row.original.no_image ? (
              <StatusBadge tone="neutral">{t("hidden")}</StatusBadge>
            ) : (
              <StatusBadge tone="success">{t("visible")}</StatusBadge>
            ),
          meta: { className: "w-32" },
        }),
        col.display({
          id: "actions",
          header: () => tTable("actions"),
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="data-popup-open:bg-muted"
                    aria-label={`${tTable("actions")}: ${row.original.name_en}`}
                  />
                }
              >
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem render={<Link href={`${BANNERS_PATH}/${row.original.id}/edit`} />}>
                  <Pencil />
                  {t("edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setToDelete({ rows: [row.original] })}>
                  <Trash2 />
                  {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
          meta: { className: "w-20", align: "center" },
        }),
      ]),
    [t, tTable]
  )

  if (isError && !data) return <QueryError message={t("loadError")} onRetry={() => refetch()} />

  const deleting = toDelete?.rows ?? []

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data ?? NO_ROWS}
        rowCount={data?.total ?? 0}
        query={query}
        onQueryChange={setQuery}
        isLoading={isPending}
        isFetching={isFetching}
        getRowId={(row) => row.id}
        enableRowSelection
        filters={
          <DataTableFacetFilter
            title={t("filterSection")}
            options={bannerSections.map((value) => ({ value, label: t(`sections.${value}`) }))}
            value={query.filters.section ?? []}
            onChange={(section) => setQuery({ filters: { ...query.filters, section }, page: 1 })}
          />
        }
        bulkActions={(rows, clearSelection) => (
          <Button variant="destructive" size="sm" onClick={() => setToDelete({ rows, done: clearSelection })}>
            <Trash2 data-icon="inline-start" />
            {t("deleteSelected")}
          </Button>
        )}
        exportOptions={{
          fileName: "internal-banners",
          title: t("title"),
          fetchRows: () => fetchAllRows(bannersApi.list, query),
          columns: [
            { header: t("columns.section"), value: (row) => t(`sections.${row.section}`) },
            { header: t("columns.nameEn"), value: (row) => row.name_en, dir: "ltr" },
            { header: t("columns.nameAr"), value: (row) => row.name_ar, dir: "rtl" },
            { header: t("columns.picture"), value: (row) => row.image_url, type: "image" },
            { header: t("columns.noImage"), value: (row) => (row.no_image ? t("hidden") : t("visible")) },
          ],
        }}
        toolbar={
          <Button nativeButton={false} render={<Link href={`${BANNERS_PATH}/new`} />}>
            <Plus data-icon="inline-start" />
            {t("new")}
          </Button>
        }
      />

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleting.length === 1
                ? t("deleteTitle", { name: deleting[0].name_en })
                : t("bulkDeleteTitle", { count: deleting.length })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleting.length === 1 ? t("deleteDescription") : t("bulkDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteCancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate(deleting)}>
              {t("deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
