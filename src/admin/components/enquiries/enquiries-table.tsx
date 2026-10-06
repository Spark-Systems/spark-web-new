"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, Mail, MailOpen, Reply, Trash2 } from "lucide-react"
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
import { enquiriesApi, enquiriesQueries } from "@admin/lib/api/services/records"
import type { Enquiry, EnquiryStatus } from "@admin/lib/api/types"
import { useAuth } from "@admin/lib/auth/auth-provider"

const col = dataTableColumnHelper<Enquiry>()
const NO_ROWS: Enquiry[] = []
const tones: Record<EnquiryStatus, StatusTone> = { new: "warning", read: "neutral", archived: "neutral" }

/** Messages from the website's contact forms: read them, mark them handled, export them. */
export function EnquiriesTable() {
  const t = useTranslations("Enquiries")
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canEdit = user?.role !== "viewer"
  const [query, setQuery] = useDataTableQuery({ sort: { id: "created_at", desc: true } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(enquiriesQueries.list(query))
  const [open, setOpen] = useState<Enquiry | null>(null)
  const [toDelete, setToDelete] = useState<{ rows: Enquiry[]; done?: () => void } | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: enquiriesQueries.all })

  const setStatus = useMutation({
    mutationFn: ({ rows, status }: { rows: Enquiry[]; status: EnquiryStatus; done?: () => void; quiet?: boolean }) =>
      Promise.all(rows.map((row) => enquiriesApi.setStatus(row.id, status))),
    onSuccess: (updated, { done, quiet }) => {
      refresh()
      setOpen((current) => (current ? (updated.find((e) => e.id === current.id) ?? current) : current))
      if (!quiet) toast.success(t("updated", { count: updated.length }))
      done?.()
    },
    onError: () => toast.error(t("updateError")),
  })

  const remove = useMutation({
    mutationFn: (rows: Enquiry[]) => Promise.all(rows.map((row) => enquiriesApi.remove(row.id))),
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

  /** Opening an unread message marks it read. */
  const view = (enquiry: Enquiry) => {
    setOpen(enquiry)
    if (enquiry.status === "new" && canEdit) setStatus.mutate({ rows: [enquiry], status: "read", quiet: true })
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
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.from")} />,
          cell: ({ row }) => (
            <button type="button" onClick={() => view(row.original)} className="flex flex-col text-start hover:underline">
              <span className={row.original.status === "new" ? "font-semibold" : "font-medium"}>{row.original.name}</span>
              <span dir="ltr" className="text-muted-foreground text-xs">
                {row.original.email}
              </span>
            </button>
          ),
        }),
        col.accessor("company", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.company")} />,
          cell: ({ row }) => row.original.company || <span className="text-muted-foreground">—</span>,
        }),
        col.display({
          id: "message",
          header: () => t("columns.message"),
          cell: ({ row }) => <span className="text-muted-foreground line-clamp-2 max-w-md text-sm">{row.original.message}</span>,
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
          fileName: "enquiries",
          title: t("title"),
          fetchRows: () => fetchAllRows(enquiriesApi.list, query),
          columns: [
            { header: t("columns.received"), value: (row) => format.dateTime(new Date(row.created_at), { dateStyle: "medium", timeStyle: "short" }) },
            { header: t("columns.name"), value: (row) => row.name },
            { header: t("columns.email"), value: (row) => row.email, dir: "ltr" },
            { header: t("columns.company"), value: (row) => row.company },
            { header: t("columns.message"), value: (row) => row.message },
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
                  {[open.company, format.dateTime(new Date(open.created_at), { dateStyle: "full", timeStyle: "short" })].filter(Boolean).join(" · ")}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                <a href={`mailto:${open.email}`} dir="ltr" className="text-primary self-start text-sm hover:underline">
                  {open.email}
                </a>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{open.message}</p>
                {open.source && (
                  <p className="text-muted-foreground text-xs" dir="ltr">
                    {t("sentFrom", { page: open.source })}
                  </p>
                )}
              </div>
              <SheetFooter className="flex-row flex-wrap border-t">
                <Button nativeButton={false} render={<a href={`mailto:${open.email}?subject=${encodeURIComponent(t("replySubject"))}`} />}>
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
