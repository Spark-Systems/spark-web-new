"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DataTable, DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { DataTableFacetFilter } from "@admin/components/data-table/data-table-facet-filter"
import { RowActions } from "@admin/components/data-table/row-actions"
import { TableThumbnail } from "@admin/components/data-table/table-thumbnail"
import { useDataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { DeleteDialog } from "@admin/components/delete-dialog"
import { QueryError } from "@admin/components/query-error"
import { StatusBadge } from "@admin/components/status-badge"
import { Button } from "@admin/components/ui/button"
import { fetchAllRows } from "@admin/lib/api/fetch-all"
import { siteServicesResource } from "@admin/lib/api/services/site-content"
import type { SiteService } from "@admin/lib/api/types"
import { Icon } from "@/components/ui/icon"
import { SERVICES_PATH } from "./service-form"

const { api, queries } = siteServicesResource
const col = dataTableColumnHelper<SiteService>()
// Stable fallback: a fresh [] each render would make the table rebuild its rows.
const NO_ROWS: SiteService[] = []

export function ServicesTable() {
  const t = useTranslations("Services")
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const [query, setQuery] = useDataTableQuery({ sort: { id: "order", desc: false } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(queries.list(query))
  const [toDelete, setToDelete] = useState<{ rows: SiteService[]; done?: () => void } | null>(null)

  const remove = useMutation({
    mutationFn: (rows: SiteService[]) => Promise.all(rows.map((row) => api.remove(row.id))),
    onSuccess: (_, rows) => {
      // Deleting every row on the last page would leave an empty page; step back.
      if (data && rows.length >= data.data.length && query.page > 1) setQuery({ page: query.page - 1 })
      queryClient.invalidateQueries({ queryKey: queries.all })
      toast.success(rows.length === 1 ? t("deleted") : t("bulkDeleted", { count: rows.length }))
      toDelete?.done?.()
      setToDelete(null)
    },
    onError: () => toast.error(t("deleteError")),
  })

  const columns = useMemo(() => {
    const yesNo = (value: boolean) =>
      value ? <StatusBadge tone="success">{t("yes")}</StatusBadge> : <StatusBadge tone="neutral">{t("no")}</StatusBadge>
    return col.columns([
      col.accessor("name_en", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.nameEn")} />,
        cell: ({ row }) => (
          <span dir="ltr" className="inline-flex items-center gap-2.5 font-medium">
            <span className="bg-accent text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Icon name={row.original.icon} size={16} />
            </span>
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
        cell: ({ row }) => (
          <TableThumbnail src={row.original.image_url} alt={row.original.name_en} emptyLabel={t("noPicture")} />
        ),
        meta: { className: "w-32" },
      }),
      col.accessor("has_detail", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.hasDetail")} />,
        cell: ({ row }) => yesNo(row.original.has_detail),
        meta: { className: "w-36" },
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
          <RowActions
            label={row.original.name_en}
            editHref={`${SERVICES_PATH}/${row.original.id}/edit`}
            onDelete={() => setToDelete({ rows: [row.original] })}
            editLabel={t("edit")}
            deleteLabel={t("delete")}
          />
        ),
        meta: { className: "w-20", align: "center" },
      }),
    ])
  }, [t, tTable, format])

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
          <>
            <DataTableFacetFilter
              title={t("filterDetail")}
              options={[
                { value: "yes", label: t("yes") },
                { value: "no", label: t("no") },
              ]}
              value={query.filters.detail ?? []}
              onChange={(detail) => setQuery({ filters: { ...query.filters, detail }, page: 1 })}
            />
            <DataTableFacetFilter
              title={t("filterStatus")}
              options={[
                { value: "visible", label: t("visible") },
                { value: "hidden", label: t("hidden") },
              ]}
              value={query.filters.status ?? []}
              onChange={(status) => setQuery({ filters: { ...query.filters, status }, page: 1 })}
            />
          </>
        }
        bulkActions={(rows, clearSelection) => (
          <Button variant="destructive" size="sm" onClick={() => setToDelete({ rows, done: clearSelection })}>
            <Trash2 data-icon="inline-start" />
            {t("deleteSelected")}
          </Button>
        )}
        exportOptions={{
          fileName: "services",
          title: t("title"),
          fetchRows: () => fetchAllRows(api.list, query),
          columns: [
            { header: t("columns.nameEn"), value: (row) => row.name_en, dir: "ltr" },
            { header: t("columns.nameAr"), value: (row) => row.name_ar, dir: "rtl" },
            { header: t("columns.slug"), value: (row) => row.slug, dir: "ltr" },
            { header: t("columns.picture"), value: (row) => row.image_url, type: "image" },
            { header: t("columns.hasDetail"), value: (row) => (row.has_detail ? t("yes") : t("no")) },
            { header: t("columns.order"), value: (row) => row.order, type: "number" },
            { header: t("columns.status"), value: (row) => (row.hidden ? t("hidden") : t("visible")) },
          ],
        }}
        toolbar={
          <Button nativeButton={false} render={<Link href={`${SERVICES_PATH}/new`} />}>
            <Plus data-icon="inline-start" />
            {t("new")}
          </Button>
        }
      />

      <DeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={
          deleting.length === 1
            ? t("deleteTitle", { name: deleting[0].name_en })
            : t("bulkDeleteTitle", { count: deleting.length })
        }
        description={deleting.length === 1 ? t("deleteDescription") : t("bulkDeleteDescription")}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("deleteCancel")}
        pending={remove.isPending}
        onConfirm={() => remove.mutate(deleting)}
      />
    </>
  )
}
