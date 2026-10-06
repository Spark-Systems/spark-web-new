"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import { NameCell, PictureCell, YesNo } from "@admin/components/cms/cells"
import { CollectionTable } from "@admin/components/cms/collection-table"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { solutionsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, SolutionRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Row = CollectionRow<SolutionRecord>

export const solutionPreviewPath = (s: Pick<SolutionRecord, "slug" | "has_detail">) =>
  s.has_detail ? `/solutions/${s.slug}` : "/solutions"

export function SolutionsTable() {
  const t = useTranslations("Solutions")
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
      col.accessor("flagship", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.flagship")} />,
        cell: ({ row }) => <YesNo value={row.original.flagship} />,
        meta: { className: "w-32" },
      }),
      col.accessor("has_detail", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.detail")} />,
        cell: ({ row }) => <YesNo value={row.original.has_detail} />,
        meta: { className: "w-32" },
      }),
    ]
  }, [t])

  const yesNo = [
    { value: "yes", label: tCommon("yes") },
    { value: "no", label: tCommon("no") },
  ]

  return (
    <CollectionTable
      resource={solutionsResource}
      basePath={adminPaths.solutions}
      nameOf={(row) => row.name}
      columns={columns}
      exportName="solutions"
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.name"), value: (row) => row.name },
        { header: t("columns.slug"), value: (row) => row.slug, dir: "ltr" },
        { header: t("columns.picture"), value: (row) => row.image?.src ?? "", type: "image" },
        { header: t("columns.flagship"), value: (row) => (row.flagship ? tCommon("yes") : tCommon("no")) },
        { header: t("columns.detail"), value: (row) => (row.has_detail ? tCommon("yes") : tCommon("no")) },
      ]}
      facets={[
        { key: "flagship", title: t("columns.flagship"), options: yesNo },
        { key: "detail", title: t("columns.detail"), options: yesNo },
      ]}
      newLabel={t("new")}
      previewPath={solutionPreviewPath}
    />
  )
}
