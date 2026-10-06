"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ellipsis, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DataTable, DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { DataTableFacetFilter } from "@admin/components/data-table/data-table-facet-filter"
import { TableThumbnail } from "@admin/components/data-table/table-thumbnail"
import { useDataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { QueryError } from "@admin/components/query-error"
import { StatusBadge } from "@admin/components/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@admin/components/ui/alert-dialog"
import { Button } from "@admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu"
import { fetchAllRows } from "@admin/lib/api/fetch-all"
import type { LogoItem } from "@admin/lib/api/types"
import { logoItemsConfigs, useLogoItemsT, type LogoItemsKind } from "./config"

const col = dataTableColumnHelper<LogoItem>()
// Stable fallback: a fresh [] each render would make the table rebuild its rows.
const NO_ROWS: LogoItem[] = []

export function LogoItemsTable({ kind }: { kind: LogoItemsKind }) {
  const config = logoItemsConfigs[kind]
  const { api, queries } = config.api
  const t = useLogoItemsT(config)
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const [query, setQuery] = useDataTableQuery({ sort: { id: "order", desc: false } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(queries.list(query))
  const [toDelete, setToDelete] = useState<{ rows: LogoItem[]; done?: () => void } | null>(null)

  const remove = useMutation({
    mutationFn: (rows: LogoItem[]) => Promise.all(rows.map((row) => api.remove(row.id))),
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

  const columns = useMemo(
    () =>
      col.columns([
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
          id: "logo",
          header: () => t("columns.logo"),
          cell: ({ row }) => (
            <TableThumbnail
              src={row.original.logo_url}
              alt={row.original.name_en}
              emptyLabel={t("noLogo")}
              className="bg-white object-contain p-1"
            />
          ),
          meta: { className: "w-32" },
        }),
        col.accessor("link", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.link")} />,
          cell: ({ row }) =>
            row.original.link ? (
              <a
                href={row.original.link}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="text-primary inline-flex max-w-56 items-center gap-1 hover:underline"
              >
                <span className="truncate">{row.original.link.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
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
                    aria-label={`${tTable("actions")}: ${row.original.name_en}`}
                  />
                }
              >
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem render={<Link href={`${config.path}/${row.original.id}/edit`} />}>
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
    [t, tTable, format, config.path]
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
          fileName: config.fileName,
          title: t("title"),
          fetchRows: () => fetchAllRows(api.list, query),
          columns: [
            { header: t("columns.nameEn"), value: (row) => row.name_en, dir: "ltr" },
            { header: t("columns.nameAr"), value: (row) => row.name_ar, dir: "rtl" },
            { header: t("columns.logo"), value: (row) => row.logo_url, type: "image" },
            { header: t("columns.link"), value: (row) => row.link, dir: "ltr" },
            { header: t("columns.order"), value: (row) => row.order, type: "number" },
            { header: t("columns.status"), value: (row) => (row.hidden ? t("hidden") : t("visible")) },
          ],
        }}
        toolbar={
          <Button nativeButton={false} render={<Link href={`${config.path}/new`} />}>
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
