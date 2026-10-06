"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchAllRows } from "@/lib/api/fetch-all"
import { homeBannersApi, homeBannersQueries } from "@/lib/api/services/home"
import type { HomeBanner } from "@/lib/api/types"
import { HOME_BANNERS_PATH } from "./home-banner-form"

const col = dataTableColumnHelper<HomeBanner>()
// Stable fallback: a fresh [] each render would make the table rebuild its rows.
const NO_ROWS: HomeBanner[] = []

export function HomeBannersTable() {
  const t = useTranslations("HomeBanners")
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const [query, setQuery] = useDataTableQuery({ sort: { id: "order", desc: false } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(homeBannersQueries.list(query))
  const [toDelete, setToDelete] = useState<{ rows: HomeBanner[]; done?: () => void } | null>(null)

  const remove = useMutation({
    mutationFn: (rows: HomeBanner[]) => Promise.all(rows.map((row) => homeBannersApi.remove(row.id))),
    onSuccess: (_, rows) => {
      // Deleting every row on the last page would leave an empty page; step back.
      if (data && rows.length >= data.data.length && query.page > 1) setQuery({ page: query.page - 1 })
      queryClient.invalidateQueries({ queryKey: homeBannersQueries.all })
      toast.success(rows.length === 1 ? t("deleted") : t("bulkDeleted", { count: rows.length }))
      toDelete?.done?.()
      setToDelete(null)
    },
    onError: () => toast.error(t("deleteError")),
  })

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor("headline1_en", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.headline1En")} />,
          cell: ({ row }) => (
            <span dir="ltr" className="font-medium">
              {row.original.headline1_en}
            </span>
          ),
        }),
        col.accessor("headline1_ar", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.headline1Ar")} />,
          cell: ({ row }) => <span dir="rtl">{row.original.headline1_ar}</span>,
        }),
        col.display({
          id: "picture_ar",
          header: () => t("columns.pictureAr"),
          cell: ({ row }) => (
            <TableThumbnail src={row.original.image_ar_url} alt={row.original.headline1_ar} emptyLabel={t("noPicture")} />
          ),
          meta: { className: "w-32" },
        }),
        col.display({
          id: "picture_en",
          header: () => t("columns.pictureEn"),
          cell: ({ row }) => (
            <TableThumbnail src={row.original.image_en_url} alt={row.original.headline1_en} emptyLabel={t("noPicture")} />
          ),
          meta: { className: "w-32" },
        }),
        col.accessor("order", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.order")} />,
          cell: ({ row }) => <span className="tabular-nums">{format.number(row.original.order)}</span>,
          meta: { className: "w-28" },
        }),
        col.accessor("hidden", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.status")} />,
          cell: ({ row }) =>
            row.original.hidden ? (
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
                    aria-label={`${tTable("actions")}: ${row.original.headline1_en}`}
                  />
                }
              >
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem render={<Link href={`${HOME_BANNERS_PATH}/${row.original.id}/edit`} />}>
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
    [t, tTable, format]
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
            title={t("filterStatus")}
            options={[
              { value: "visible", label: t("visible") },
              { value: "hidden", label: t("hidden") },
            ]}
            value={query.filters.status ?? []}
            onChange={(status) => setQuery({ filters: { ...query.filters, status }, page: 1 })}
          />
        }
        bulkActions={(rows, clearSelection) => (
          <Button variant="destructive" size="sm" onClick={() => setToDelete({ rows, done: clearSelection })}>
            <Trash2 data-icon="inline-start" />
            {t("deleteSelected")}
          </Button>
        )}
        exportOptions={{
          fileName: "home-banners",
          title: t("title"),
          fetchRows: () => fetchAllRows(homeBannersApi.list, query),
          columns: [
            { header: t("columns.headline1En"), value: (row) => row.headline1_en, dir: "ltr" },
            { header: t("columns.headline1Ar"), value: (row) => row.headline1_ar, dir: "rtl" },
            { header: t("columns.pictureAr"), value: (row) => row.image_ar_url, type: "image" },
            { header: t("columns.pictureEn"), value: (row) => row.image_en_url, type: "image" },
            { header: t("columns.order"), value: (row) => row.order, type: "number" },
            { header: t("columns.status"), value: (row) => (row.hidden ? t("hidden") : t("visible")) },
          ],
        }}
        toolbar={
          <Button nativeButton={false} render={<Link href={`${HOME_BANNERS_PATH}/new`} />}>
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
                ? t("deleteTitle", { name: deleting[0].headline1_en })
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
