"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import { CollectionTable } from "@admin/components/cms/collection-table"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { jobsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, JobRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Row = CollectionRow<JobRecord>

export function JobsTable() {
  const t = useTranslations("Jobs")

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row>()
    return [
      col.accessor("title", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.title")} />,
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      }),
      col.accessor("location", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.location")} />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.location}</span>,
      }),
    ]
  }, [t])

  return (
    <CollectionTable
      resource={jobsResource}
      basePath={adminPaths.careers}
      nameOf={(row) => row.title}
      columns={columns}
      exportName="open-roles"
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.title"), value: (row) => row.title },
        { header: t("columns.location"), value: (row) => row.location },
      ]}
      newLabel={t("new")}
      previewPath={() => "/careers"}
    />
  )
}
