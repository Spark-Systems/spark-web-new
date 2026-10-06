"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DataTable, DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { DataTableFacetFilter } from "@admin/components/data-table/data-table-facet-filter"
import { RowActions } from "@admin/components/data-table/row-actions"
import { useDataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { DeleteDialog } from "@admin/components/delete-dialog"
import { QueryError } from "@admin/components/query-error"
import { StatusBadge } from "@admin/components/status-badge"
import { Button } from "@admin/components/ui/button"
import { isApiError } from "@admin/lib/api/errors"
import { usersApi, usersQueries } from "@admin/lib/api/services/records"
import type { User, UserRole } from "@admin/lib/api/types"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { adminPaths } from "@admin/lib/paths"

const col = dataTableColumnHelper<User>()
const NO_ROWS: User[] = []

export function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations("Users.roles")
  return <StatusBadge tone={role === "admin" ? "success" : role === "editor" ? "warning" : "neutral"}>{t(role)}</StatusBadge>
}

/** People who can sign in to the admin (admins only). */
export function UsersTable() {
  const t = useTranslations("Users")
  const tTable = useTranslations("DataTable")
  const format = useFormatter()
  const queryClient = useQueryClient()
  const { user: me } = useAuth()
  const [query, setQuery] = useDataTableQuery({ sort: { id: "name", desc: false } })
  const { data, isPending, isFetching, isError, refetch } = useQuery(usersQueries.list(query))
  const [toDelete, setToDelete] = useState<User | null>(null)

  const remove = useMutation({
    mutationFn: (user: User) => usersApi.remove(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueries.all })
      toast.success(t("deleted"))
      setToDelete(null)
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : t("deleteError")),
  })

  const columns = useMemo(
    () =>
      col.columns([
        col.accessor("name", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.name")} />,
          cell: ({ row }) => (
            <span className="flex flex-col">
              <span className="font-medium">
                {row.original.name}
                {row.original.id === me?.id && <span className="text-muted-foreground font-normal"> ({t("you")})</span>}
              </span>
              <span dir="ltr" className="text-muted-foreground text-xs">
                {row.original.email}
              </span>
            </span>
          ),
        }),
        col.accessor("role", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.role")} />,
          cell: ({ row }) => <RoleBadge role={row.original.role} />,
          meta: { className: "w-32" },
        }),
        col.accessor("last_login_at", {
          header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.lastLogin")} />,
          cell: ({ row }) =>
            row.original.last_login_at ? (
              <span className="text-muted-foreground text-sm">
                {format.relativeTime(new Date(row.original.last_login_at))}
              </span>
            ) : (
              <span className="text-muted-foreground">{t("never")}</span>
            ),
          meta: { className: "w-40" },
        }),
        col.display({
          id: "actions",
          header: () => tTable("actions"),
          cell: ({ row }) => (
            <RowActions
              label={row.original.name}
              editHref={`${adminPaths.users}/${row.original.id}/edit`}
              onDelete={() => setToDelete(row.original)}
              editLabel={t("edit")}
              deleteLabel={t("delete")}
            />
          ),
          meta: { className: "w-20", align: "center" },
        }),
      ]),
    [t, tTable, format, me?.id],
  )

  if (isError && !data) return <QueryError message={t("loadError")} onRetry={() => refetch()} />

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
        filters={
          <DataTableFacetFilter
            title={t("columns.role")}
            options={(["admin", "editor", "viewer"] as const).map((value) => ({ value, label: t(`roles.${value}`) }))}
            value={query.filters.role ?? []}
            onChange={(role) => setQuery({ filters: { ...query.filters, role }, page: 1 })}
          />
        }
        toolbar={
          <Button nativeButton={false} render={<Link href={`${adminPaths.users}/new`} />}>
            <Plus data-icon="inline-start" />
            {t("new")}
          </Button>
        }
      />
      <DeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t("deleteTitle", { name: toDelete?.name ?? "" })}
        description={t("deleteDescription")}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("cancel")}
        pending={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
      />
    </>
  )
}
