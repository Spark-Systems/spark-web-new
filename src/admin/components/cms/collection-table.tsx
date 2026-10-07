"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Eye, EyeOff, ExternalLink, Pencil, Plus, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  DataTable,
  DataTableColumnHeader,
  dataTableColumnHelper,
  type DataTableFeatures,
} from "@admin/components/data-table/data-table"
import type { ExportColumn } from "@admin/components/data-table/data-table-export"
import { DataTableFacetFilter, type FacetOption } from "@admin/components/data-table/data-table-facet-filter"
import { useDataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { DeleteDialog } from "@admin/components/delete-dialog"
import { QueryError } from "@admin/components/query-error"
import { Button } from "@admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu"
import { fetchAllRows } from "@admin/lib/api/fetch-all"
import type { Resource } from "@admin/lib/api/resource"
import type { CollectionKey, CollectionMap, CollectionRow, PublishAction } from "@admin/lib/api/types"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { openPreview } from "./publish-actions"
import { PublishStatusBadge } from "./publish-status-badge"

type Row<K extends CollectionKey> = CollectionRow<CollectionMap[K]>

// Stable fallback: a fresh [] each render would make the table rebuild its rows.
const NO_ROWS: never[] = []

export interface CollectionFacet {
  /** Query key the API filters by, e.g. "detail". */
  key: string
  title: string
  options: FacetOption[]
}

export interface CollectionTableProps<K extends CollectionKey> {
  resource: Resource<K>
  /** Admin list path; items edit at `${basePath}/:id/edit`, new ones at `${basePath}/new`. */
  basePath: string
  /** Name of a row (actions, delete confirmation). */
  nameOf: (row: Row<K>) => string
  /** The list's own columns, shown between the selection box and Status. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns mix value types
  columns: ColumnDef<DataTableFeatures, Row<K>, any>[]
  /** The list's own export columns; Status and Order are added. */
  exportColumns: ExportColumn<Row<K>>[]
  exportName: string
  exportTitle: string
  facets?: CollectionFacet[]
  newLabel: string
  /** Website page that shows a row, for the Preview action. */
  previewPath?: (row: Row<K>) => string
  /** Initial sort (default: display order). */
  defaultSort?: { id: string; desc: boolean }
  /** Hide the Order column (lists not sorted by it, e.g. articles by date). */
  hideOrder?: boolean
}

/**
 * Server-side table for a draft/publish list: search, facet filters (Status
 * included), sort, pages, Excel/print export, row actions (edit, publish,
 * unpublish, preview, delete) and bulk publish/delete.
 */
export function CollectionTable<K extends CollectionKey>({
  resource,
  basePath,
  nameOf,
  columns: ownColumns,
  exportColumns,
  exportName,
  exportTitle,
  facets = [],
  newLabel,
  previewPath,
  defaultSort = { id: "order", desc: false },
  hideOrder = false,
}: CollectionTableProps<K>) {
  const t = useTranslations("Publish")
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canEdit = user?.role !== "viewer"
  const { api, queries } = resource
  const [query, setQuery] = useDataTableQuery({ sort: defaultSort })
  const { data, isPending, isFetching, isError, refetch } = useQuery(queries.list(query))
  const [toDelete, setToDelete] = useState<{ rows: Row<K>[]; done?: () => void } | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: queries.all })

  const remove = useMutation({
    mutationFn: (rows: Row<K>[]) => Promise.all(rows.map((row) => api.remove(row.id))),
    onSuccess: (_, rows) => {
      // Deleting every row on the last page would leave an empty page; step back.
      if (data && rows.length >= data.data.length && query.page > 1) setQuery({ page: query.page - 1 })
      refresh()
      toast.success(rows.length === 1 ? t("deleted") : t("bulkDeleted", { count: rows.length }))
      toDelete?.done?.()
      setToDelete(null)
    },
    onError: () => toast.error(t("deleteError")),
  })

  const act = useMutation({
    mutationFn: ({ rows, action }: { rows: Row<K>[]; action: PublishAction; done?: () => void }) =>
      Promise.all(rows.map((row) => api.act(row.id, action))),
    onSuccess: (_, { rows, action, done }) => {
      refresh()
      toast.success(
        action === "publish"
          ? t("bulkPublished", { count: rows.length })
          : t("bulkUnpublished", { count: rows.length }),
      )
      done?.()
    },
    onError: () => toast.error(t("actionError")),
  })

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row<K>>()
    const orderColumn = col.accessor((row) => row.order, {
      id: "order",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.order")} />,
      cell: ({ row }) => <span className="tabular-nums">{format.number(row.original.order)}</span>,
      meta: { className: "w-24" },
    })
    return [
      ...ownColumns,
      ...(hideOrder ? [] : [orderColumn]),
      col.accessor((row) => row.status, {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.status")} />,
        cell: ({ row }) => <PublishStatusBadge status={row.original.status} />,
        meta: { className: "w-44" },
      }),
      col.accessor((row) => row.updated_at, {
        id: "updated_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.updated")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground flex flex-col text-xs">
            <span>{format.dateTime(new Date(row.original.updated_at), { dateStyle: "medium", timeStyle: "short" })}</span>
            {row.original.updated_by && <span>{row.original.updated_by}</span>}
          </span>
        ),
        meta: { className: "w-44" },
      }),
      col.display({
        id: "actions",
        header: () => tTable("actions"),
        cell: ({ row }) => {
          const item = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label={`${tTable("actions")}: ${nameOf(item)}`} />}
              >
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem render={<Link href={`${basePath}/${item.id}/edit`} />}>
                  {canEdit ? <Pencil /> : <Eye />}
                  {canEdit ? t("edit") : t("view")}
                </DropdownMenuItem>
                {previewPath && (
                  <DropdownMenuItem onClick={() => void openPreview(previewPath(item))}>
                    <ExternalLink />
                    {t("preview")}
                  </DropdownMenuItem>
                )}
                {canEdit && item.status !== "published" && (
                  <DropdownMenuItem onClick={() => act.mutate({ rows: [item], action: "publish" })}>
                    <Send />
                    {t("publish")}
                  </DropdownMenuItem>
                )}
                {canEdit && item.status !== "draft" && (
                  <DropdownMenuItem onClick={() => act.mutate({ rows: [item], action: "unpublish" })}>
                    <EyeOff />
                    {t("unpublish")}
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setToDelete({ rows: [item] })}>
                      <Trash2 />
                      {t("delete")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        meta: { className: "w-20", align: "center" },
      }),
    ]
  }, [ownColumns, hideOrder, t, tTable, format, basePath, nameOf, previewPath, canEdit, act])

  if (isError && !data) return <QueryError message={t("loadError")} onRetry={() => refetch()} />

  const deleting = toDelete?.rows ?? []
  const statusOptions: FacetOption[] = (["published", "changed", "draft"] as const).map((value) => ({
    value,
    label: t(`status.${value}`),
  }))

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
        enableRowSelection={canEdit}
        filters={
          <>
            {facets.map((facet) => (
              <DataTableFacetFilter
                key={facet.key}
                title={facet.title}
                options={facet.options}
                value={query.filters[facet.key] ?? []}
                onChange={(value) => setQuery({ filters: { ...query.filters, [facet.key]: value }, page: 1 })}
              />
            ))}
            <DataTableFacetFilter
              title={t("columns.status")}
              options={statusOptions}
              value={query.filters.status ?? []}
              onChange={(status) => setQuery({ filters: { ...query.filters, status }, page: 1 })}
            />
          </>
        }
        bulkActions={(rows, clearSelection) => (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={act.isPending}
              onClick={() => act.mutate({ rows, action: "publish", done: clearSelection })}
            >
              <Send data-icon="inline-start" />
              {t("publishSelected")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setToDelete({ rows, done: clearSelection })}>
              <Trash2 data-icon="inline-start" />
              {t("deleteSelected")}
            </Button>
          </>
        )}
        exportOptions={{
          fileName: exportName,
          title: exportTitle,
          fetchRows: () => fetchAllRows(api.list, query),
          columns: [
            ...exportColumns,
            ...(hideOrder ? [] : [{ header: t("columns.order"), value: (row: Row<K>) => row.order, type: "number" as const }]),
            { header: t("columns.status"), value: (row) => t(`status.${row.status}`) },
          ],
        }}
        toolbar={
          canEdit && (
            <Button nativeButton={false} render={<Link href={`${basePath}/new`} />}>
              <Plus data-icon="inline-start" />
              {newLabel}
            </Button>
          )
        }
      />

      <DeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={
          deleting.length === 1 ? t("deleteTitle", { name: nameOf(deleting[0]) }) : t("bulkDeleteTitle", { count: deleting.length })
        }
        description={t("deleteDescription")}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("cancel")}
        pending={remove.isPending}
        onConfirm={() => remove.mutate(deleting)}
      />
    </>
  )
}
