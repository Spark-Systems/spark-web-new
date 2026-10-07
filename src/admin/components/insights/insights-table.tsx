"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useMemo } from "react"

import { NameCell, PictureCell, YesNo } from "@admin/components/cms/cells"
import { CollectionTable } from "@admin/components/cms/collection-table"
import { imageUrl } from "@admin/components/cms/images"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { insightsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, InsightRecord, UploadedImage } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Row = CollectionRow<InsightRecord>

export const insightPreviewPath = (a: Pick<InsightRecord, "slug">) => `/insights/${a.slug}`

/** The cover as a table thumbnail (external URLs have no size, so wrap them). */
const cover = (image: InsightRecord["image"]): UploadedImage | null => {
  const src = imageUrl(image)
  return src ? (typeof image === "string" ? { src, width: 0, height: 0 } : image) : null
}

export function InsightsTable() {
  const t = useTranslations("Insights")
  const tCommon = useTranslations("Common")
  const format = useFormatter()

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row>()
    return [
      col.accessor("title", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.title")} />,
        cell: ({ row }) => <NameCell name={row.original.title} slug={row.original.slug} />,
      }),
      col.display({
        id: "cover",
        header: () => t("columns.cover"),
        cell: ({ row }) => <PictureCell image={cover(row.original.image)} alt={row.original.title} />,
        meta: { className: "w-32" },
      }),
      col.accessor("category", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.category")} />,
        cell: ({ row }) => row.original.category,
        meta: { className: "w-36" },
      }),
      col.accessor("date", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.date")} />,
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap tabular-nums">
            {format.dateTime(new Date(`${row.original.date}T00:00:00Z`), { dateStyle: "medium", timeZone: "UTC" })}
          </span>
        ),
        meta: { className: "w-36" },
      }),
      col.accessor("featured", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.featured")} />,
        cell: ({ row }) => <YesNo value={row.original.featured} />,
        meta: { className: "w-28" },
      }),
    ]
  }, [t, format])

  return (
    <CollectionTable
      resource={insightsResource}
      basePath={adminPaths.insights}
      nameOf={(row) => row.title}
      columns={columns}
      exportName="insights"
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.title"), value: (row) => row.title },
        { header: t("columns.slug"), value: (row) => row.slug, dir: "ltr" },
        { header: t("columns.category"), value: (row) => row.category },
        { header: t("columns.date"), value: (row) => row.date, dir: "ltr" },
        { header: t("columns.summary"), value: (row) => row.summary },
      ]}
      facets={[
        {
          key: "featured",
          title: t("columns.featured"),
          options: [
            { value: "yes", label: tCommon("yes") },
            { value: "no", label: tCommon("no") },
          ],
        },
      ]}
      newLabel={t("new")}
      previewPath={insightPreviewPath}
      defaultSort={{ id: "date", desc: true }}
      hideOrder
    />
  )
}
