"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import { YesNo } from "@admin/components/cms/cells"
import { CollectionTable } from "@admin/components/cms/collection-table"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { officesResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, OfficeRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Row = CollectionRow<OfficeRecord>

export function OfficesTable() {
  const t = useTranslations("Offices")

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row>()
    return [
      col.accessor("city", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.city")} />,
        cell: ({ row }) => (
          <span className="flex flex-col">
            <span className="font-medium">{row.original.city}</span>
            <span className="text-muted-foreground text-xs">{row.original.country}</span>
          </span>
        ),
      }),
      col.accessor("address", {
        header: () => t("columns.address"),
        cell: ({ row }) => <span className="text-muted-foreground line-clamp-2 text-sm">{row.original.address}</span>,
      }),
      col.accessor("time_zone", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.timeZone")} />,
        cell: ({ row }) => <span dir="ltr">{row.original.time_zone}</span>,
        meta: { className: "w-40" },
      }),
      col.accessor("hq", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.hq")} />,
        cell: ({ row }) => <YesNo value={row.original.hq} />,
        meta: { className: "w-24" },
      }),
    ]
  }, [t])

  return (
    <CollectionTable
      resource={officesResource}
      basePath={adminPaths.offices}
      nameOf={(row) => row.city}
      columns={columns}
      exportName="offices"
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.city"), value: (row) => row.city },
        { header: t("columns.country"), value: (row) => row.country },
        { header: t("columns.address"), value: (row) => row.address },
        { header: t("columns.timeZone"), value: (row) => row.time_zone, dir: "ltr" },
        { header: t("columns.contacts"), value: (row) => row.lines.map((l) => `${l.label}: ${l.value}`).join("\n") },
      ]}
      newLabel={t("new")}
      previewPath={() => "/contact"}
    />
  )
}
