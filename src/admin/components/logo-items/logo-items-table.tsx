"use client"

import { useMemo } from "react"

import { PictureCell, YesNo } from "@admin/components/cms/cells"
import { CollectionTable } from "@admin/components/cms/collection-table"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import type { Resource } from "@admin/lib/api/resource"
import type { CollectionRow, LogoRecord } from "@admin/lib/api/types"
import { logoItemsConfigs, useLogoItemsT, type LogoItemsKind } from "./config"

type Row = CollectionRow<LogoRecord>

export function LogoItemsTable({ kind }: { kind: LogoItemsKind }) {
  const config = logoItemsConfigs[kind]
  const t = useLogoItemsT(config)

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row>()
    return [
      col.accessor("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.name")} />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      }),
      col.display({
        id: "logo",
        header: () => t("columns.logo"),
        cell: ({ row }) => <PictureCell image={row.original.logo} alt={row.original.name} logo />,
        meta: { className: "w-32" },
      }),
      col.accessor("link", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.link")} />,
        cell: ({ row }) =>
          row.original.link ? (
            <a href={row.original.link} target="_blank" rel="noreferrer" dir="ltr" className="text-primary text-sm hover:underline">
              {row.original.link.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      col.accessor("invert", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.invert")} />,
        cell: ({ row }) => <YesNo value={row.original.invert} />,
        meta: { className: "w-32" },
      }),
    ]
  }, [t])

  return (
    <CollectionTable
      // Both lists share one row shape; typed as clients so the table's generics line up.
      resource={config.resource as Resource<"clients">}
      basePath={config.path}
      nameOf={(row) => row.name}
      columns={columns}
      exportName={kind}
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.name"), value: (row) => row.name },
        { header: t("columns.logo"), value: (row) => row.logo?.src ?? "", type: "image" },
        { header: t("columns.link"), value: (row) => row.link, dir: "ltr" },
      ]}
      newLabel={t("new")}
      previewPath={() => (kind === "clients" ? "/about" : "/")}
    />
  )
}
