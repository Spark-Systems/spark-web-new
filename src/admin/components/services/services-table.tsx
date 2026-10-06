"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import { NameCell, PictureCell, YesNo } from "@admin/components/cms/cells"
import { CollectionTable } from "@admin/components/cms/collection-table"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { siteServicesResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, ServiceRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Row = CollectionRow<ServiceRecord>

export const servicePreviewPath = (s: Pick<ServiceRecord, "slug" | "has_detail">) =>
  s.has_detail ? `/services/${s.slug}` : "/services"

export function ServicesTable() {
  const t = useTranslations("Services")
  const tCommon = useTranslations("Common")

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row>()
    return [
      col.accessor("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.name")} />,
        cell: ({ row }) => <NameCell name={row.original.name} icon={row.original.icon} slug={row.original.slug} />,
      }),
      col.display({
        id: "picture",
        header: () => t("columns.picture"),
        cell: ({ row }) => <PictureCell image={row.original.image} alt={row.original.name} />,
        meta: { className: "w-32" },
      }),
      col.accessor("has_detail", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.detail")} />,
        cell: ({ row }) => <YesNo value={row.original.has_detail} />,
        meta: { className: "w-32" },
      }),
    ]
  }, [t])

  return (
    <CollectionTable
      resource={siteServicesResource}
      basePath={adminPaths.services}
      nameOf={(row) => row.name}
      columns={columns}
      exportName="services"
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.name"), value: (row) => row.name },
        { header: t("columns.slug"), value: (row) => row.slug, dir: "ltr" },
        { header: t("columns.summary"), value: (row) => row.summary },
        { header: t("columns.picture"), value: (row) => row.image?.src ?? "", type: "image" },
        { header: t("columns.detail"), value: (row) => (row.has_detail ? tCommon("yes") : tCommon("no")) },
      ]}
      facets={[
        {
          key: "detail",
          title: t("columns.detail"),
          options: [
            { value: "yes", label: tCommon("yes") },
            { value: "no", label: tCommon("no") },
          ],
        },
      ]}
      newLabel={t("new")}
      previewPath={servicePreviewPath}
    />
  )
}
