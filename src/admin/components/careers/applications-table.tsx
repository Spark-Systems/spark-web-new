"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, Download, Mail, MailOpen, Paperclip, Reply, Trash2 } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DataTable, DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { DataTableFacetFilter } from "@admin/components/data-table/data-table-facet-filter"
import { useDataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { DeleteDialog } from "@admin/components/delete-dialog"
import { QueryError } from "@admin/components/query-error"
import { StatusBadge, type StatusTone } from "@admin/components/status-badge"
import { Button } from "@admin/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@admin/components/ui/sheet"
import { fetchAllRows } from "@admin/lib/api/fetch-all"
import { applicationsApi, applicationsQueries } from "@admin/lib/api/services/records"
import type { Application, EnquiryStatus } from "@admin/lib/api/types"
import { useAuth } from "@admin/lib/auth/auth-provider"

const col = dataTableColumnHelper<Application>()
const NO_ROWS: Application[] = []
const tones: Record<EnquiryStatus, StatusTone> = { new: "warning", read: "neutral", archived: "neutral" }

/** Job applications from the careers page: read them, download CVs, mark them handled, export them. */
export function ApplicationsTable() {
  const t = useTranslations("Applications")
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canEdit = user?.role !== "viewer"
  const [query, setQuery] = useDataTableQuery({ sort: { id: "created_at", desc: true } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(applicationsQueries.list(query))
  const [open, setOpen] = useState<Application | null>(null)
  const [toDelete, setToDelete] = useState<{ rows: Application[]; done?: () => void } | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: applicationsQueries.all })

  const setStatus = useMutation({
    mutationFn: ({ rows, status }: { rows: Application[]; status: EnquiryStatus; done?: () => void; quiet?: boolean }) =>
      Promise.all(rows.map((row) => applicationsApi.setStatus(row.id, status))),
    onSuccess: (updated, { done, quiet }) => {
      refresh()
      setOpen((current) => (current ? (updated.find((a) => a.id === current.id) ?? current) : current))
      if (!quiet) toast.success(t("updated", { count: updated.length }))
      done?.()
    },
    onError: () => toast.error(t("updateError")),
  })

  const remove = useMutation({
    mutationFn: (rows: Application[]) => Promise.all(rows.map((row) => applicationsApi.remove(row.id))),
    onSuccess: (_, rows) => {
      if (data && rows.length >= data.data.length && query.page > 1) setQuery({ page: query.page - 1 })
      refresh()
      toast.success(t("deleted", { count: rows.length }))
      toDelete?.done?.()
      setToDelete(null)
      setOpen(null)
    },
    onError: () => toast.error(t("deleteError")),
  })

  const download = useMutation({
    mutationFn: applicationsApi.downloadCv,
    onError: () => toast.error(t("cvError")),
  })

  /** Opening an unread application marks it read. */
  const view = (application: Application) => {
    setOpen(application)
    if (application.status === "new" && canEdit) setStatus.mutate({ rows: [application], status: "read", quiet: true })
  }

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor("created_at", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.received")} />,
          cell: ({ row }) => (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {format.dateTime(new Date(row.original.created_at), { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ),
          meta: { className: "w-44" },
        }),
        col.accessor("name", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.applicant")} />,
          cell: ({ row }) => (
            <button type="button" onClick={() => view(row.original)} className="flex flex-col text-start hover:underline">
              <span className={row.original.status === "new" ? "font-semibold" : "font-medium"}>{row.original.name}</span>
              <span dir="ltr" className="text-muted-foreground text-xs">
                {row.original.email}
              </span>
            </button>
          ),
        }),
        col.accessor("position", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.position")} />,
          cell: ({ row }) => row.original.position || <span className="text-muted-foreground">{t("openApplication")}</span>,
        }),
        col.accessor("country", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.country")} />,
          cell: ({ row }) => row.original.country || <span className="text-muted-foreground">—</span>,
          meta: { className: "w-40" },
        }),
        col.display({
          id: "cv",
          header: () => t("columns.cv"),
          cell: ({ row }) =>
            row.original.cv ? (
              <Paperclip className="text-muted-foreground size-4" aria-label={t("hasCv")} />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
          meta: { className: "w-16", align: "center" },
        }),
        col.accessor("status", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.status")} />,
          cell: ({ row }) => <StatusBadge tone={tones[row.original.status]}>{t(`status.${row.original.status}`)}</StatusBadge>,
          meta: { className: "w-32" },
        }),
        col.display({
          id: "actions",
          header: () => tTable("actions"),
          cell: ({ row }) => (
            <Button variant="ghost" size="sm" onClick={() => view(row.original)}>
              {t("open")}
            </Button>
          ),
          meta: { className: "w-24", align: "center" },
        }),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `view` only closes over stable setters and the mutation
    [t, tTable, format, canEdit],
  )

  if (isError && !data) return <QueryError message={t("loadError")} onRetry={() => refetch()} />

  const statusOptions = (["new", "read", "archived"] as const).map((value) => ({ value, label: t(`status.${value}`) }))
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
        enableRowSelection={canEdit}
        searchPlaceholder={t("search")}
        emptyMessage={t("empty")}
        filters={
          <DataTableFacetFilter
            title={t("columns.status")}
            options={statusOptions}
            value={query.filters.status ?? []}
            onChange={(status) => setQuery({ filters: { ...query.filters, status }, page: 1 })}
          />
        }
        bulkActions={(rows, clearSelection) => (
          <>
            <Button variant="outline" size="sm" onClick={() => setStatus.mutate({ rows, status: "read", done: clearSelection })}>
              <MailOpen data-icon="inline-start" />
              {t("markRead")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStatus.mutate({ rows, status: "archived", done: clearSelection })}>
              <Archive data-icon="inline-start" />
              {t("archive")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setToDelete({ rows, done: clearSelection })}>
              <Trash2 data-icon="inline-start" />
              {t("delete")}
            </Button>
          </>
        )}
        exportOptions={{
          fileName: "applications",
          title: t("title"),
          fetchRows: () => fetchAllRows(applicationsApi.list, query),
          columns: [
            { header: t("columns.received"), value: (row) => format.dateTime(new Date(row.created_at), { dateStyle: "medium", timeStyle: "short" }) },
            { header: t("columns.name"), value: (row) => row.name },
            { header: t("columns.email"), value: (row) => row.email, dir: "ltr" },
            { header: t("columns.mobile"), value: (row) => row.mobile, dir: "ltr" },
            { header: t("columns.country"), value: (row) => row.country },
            { header: t("columns.position"), value: (row) => row.position },
            { header: t("columns.coverLetter"), value: (row) => row.cover_letter },
            { header: t("columns.status"), value: (row) => t(`status.${row.status}`) },
          ],
        }}
      />

      <Sheet open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-lg">
          {open && (
            <>
              <SheetHeader className="border-b">
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>
                  {[open.position || t("openApplication"), format.dateTime(new Date(open.created_at), { dateStyle: "full", timeStyle: "short" })].join(" · ")}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-muted-foreground">{t("columns.email")}</dt>
                  <dd dir="ltr">
                    <a href={`mailto:${open.email}`} className="text-primary hover:underline">
                      {open.email}
                    </a>
                  </dd>
                  <dt className="text-muted-foreground">{t("columns.mobile")}</dt>
                  <dd dir="ltr">
                    <a href={`tel:${open.mobile.replace(/[^\d+]/g, "")}`} className="text-primary hover:underline">
                      {open.mobile}
                    </a>
                  </dd>
                  <dt className="text-muted-foreground">{t("columns.country")}</dt>
                  <dd>{open.country || "—"}</dd>
                </dl>
                {open.cv ? (
                  <Button variant="outline" className="self-start" disabled={download.isPending} onClick={() => download.mutate(open)}>
                    <Download data-icon="inline-start" />
                    {t("downloadCv", { name: open.cv.name })}
                  </Button>
                ) : (
                  <p className="text-muted-foreground">{t("noCv")}</p>
                )}
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground">{t("columns.coverLetter")}</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{open.cover_letter || "—"}</p>
                </div>
              </div>
              <SheetFooter className="flex-row flex-wrap border-t">
                <Button nativeButton={false} render={<a href={`mailto:${open.email}?subject=${encodeURIComponent(t("replySubject", { position: open.position || t("openApplication") }))}`} />}>
                  <Reply data-icon="inline-start" />
                  {t("reply")}
                </Button>
                {canEdit && open.status !== "archived" && (
                  <Button variant="outline" onClick={() => setStatus.mutate({ rows: [open], status: "archived" })}>
                    <Archive data-icon="inline-start" />
                    {t("archive")}
                  </Button>
                )}
                {canEdit && open.status !== "new" && (
                  <Button variant="outline" onClick={() => setStatus.mutate({ rows: [open], status: "new" })}>
                    <Mail data-icon="inline-start" />
                    {t("markUnread")}
                  </Button>
                )}
                {canEdit && (
                  <Button variant="ghost" className="text-destructive ms-auto" onClick={() => setToDelete({ rows: [open] })}>
                    <Trash2 data-icon="inline-start" />
                    {t("delete")}
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <DeleteDialog
        open={toDelete !== null}
        onOpenChange={(next) => !next && setToDelete(null)}
        title={t("deleteTitle", { count: deleting.length })}
        description={t("deleteDescription")}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("cancel")}
        pending={remove.isPending}
        onConfirm={() => remove.mutate(deleting)}
      />
    </>
  )
}
