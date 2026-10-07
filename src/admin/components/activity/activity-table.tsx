"use client"

import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo } from "react"

import { DataTable, DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { DataTableFacetFilter } from "@admin/components/data-table/data-table-facet-filter"
import { useDataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { QueryError } from "@admin/components/query-error"
import { StatusBadge, type StatusTone } from "@admin/components/status-badge"
import { fetchAllRows } from "@admin/lib/api/fetch-all"
import { activityApi, activityQueries } from "@admin/lib/api/services/records"
import type { ActivityAction, ActivityEntry } from "@admin/lib/api/types"

const col = dataTableColumnHelper<ActivityEntry>()
const NO_ROWS: ActivityEntry[] = []

const actions: ActivityAction[] = ["create", "update", "publish", "unpublish", "discard", "delete", "login"]
const tones: Record<ActivityAction, StatusTone> = {
  create: "neutral",
  update: "neutral",
  publish: "success",
  unpublish: "warning",
  discard: "warning",
  delete: "danger",
  login: "neutral",
}
const resources = ["pages", "solutions", "services", "projects", "clients", "partners", "offices", "jobs", "insights", "enquiries", "applications", "users", "settings", "auth"] as const

/** Who changed what, newest first. */
export function ActivityTable() {
  const t = useTranslations("Activity")
  const format = useFormatter()
  const [query, setQuery] = useDataTableQuery({ sort: { id: "at", desc: true } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(activityQueries.list(query))

  // "pages/home" → "Pages · home"
  const resourceLabel = (resource: string) => {
    const [group, page] = resource.split("/")
    const known = (resources as readonly string[]).includes(group)
    const label = known ? t(`resources.${group as (typeof resources)[number]}`) : group
    return page ? `${label} · ${page}` : label
  }

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor("at", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.when")} />,
          cell: ({ row }) => (
            <span className="text-muted-foreground text-sm whitespace-nowrap" title={format.dateTime(new Date(row.original.at), { dateStyle: "full", timeStyle: "medium" })}>
              {format.dateTime(new Date(row.original.at), { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ),
          meta: { className: "w-48" },
        }),
        col.accessor("user_name", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.who")} />,
          cell: ({ row }) => <span className="font-medium">{row.original.user_name}</span>,
          meta: { className: "w-44" },
        }),
        col.accessor("action", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.action")} />,
          cell: ({ row }) => <StatusBadge tone={tones[row.original.action]}>{t(`actions.${row.original.action}`)}</StatusBadge>,
          meta: { className: "w-36" },
        }),
        col.accessor("resource", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.what")} />,
          cell: ({ row }) => (
            <span className="flex flex-col">
              <span>{row.original.label}</span>
              <span className="text-muted-foreground text-xs">{resourceLabel(row.original.resource)}</span>
            </span>
          ),
        }),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resourceLabel only depends on t
    [t, format],
  )

  if (isError && !data) return <QueryError message={t("loadError")} onRetry={() => refetch()} />

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? NO_ROWS}
      rowCount={data?.total ?? 0}
      query={query}
      onQueryChange={setQuery}
      isLoading={isPending}
      isFetching={isFetching}
      getRowId={(row) => row.id}
      filters={
        <>
          <DataTableFacetFilter
            title={t("columns.action")}
            options={actions.map((value) => ({ value, label: t(`actions.${value}`) }))}
            value={query.filters.action ?? []}
            onChange={(action) => setQuery({ filters: { ...query.filters, action }, page: 1 })}
          />
          <DataTableFacetFilter
            title={t("columns.what")}
            options={resources.map((value) => ({ value, label: t(`resources.${value}`) }))}
            value={query.filters.resource ?? []}
            onChange={(resource) => setQuery({ filters: { ...query.filters, resource }, page: 1 })}
          />
        </>
      }
      exportOptions={{
        fileName: "activity",
        title: t("title"),
        fetchRows: () => fetchAllRows(activityApi.list, query),
        columns: [
          { header: t("columns.when"), value: (row) => format.dateTime(new Date(row.at), { dateStyle: "medium", timeStyle: "short" }) },
          { header: t("columns.who"), value: (row) => row.user_name },
          { header: t("columns.action"), value: (row) => t(`actions.${row.action}`) },
          { header: t("columns.what"), value: (row) => `${row.label} (${resourceLabel(row.resource)})` },
        ],
      }}
    />
  )
}
