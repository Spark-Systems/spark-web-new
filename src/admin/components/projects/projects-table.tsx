"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import { NameCell, PictureCell, YesNo } from "@admin/components/cms/cells"
import { CollectionTable } from "@admin/components/cms/collection-table"
import { DataTableColumnHeader, dataTableColumnHelper } from "@admin/components/data-table/data-table"
import { projectsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, ProjectRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Row = CollectionRow<ProjectRecord>

export const projectPreviewPath = (p: Pick<ProjectRecord, "slug" | "has_detail">) =>
  p.has_detail ? `/work/${p.slug}` : "/work"

export function ProjectsTable() {
  const t = useTranslations("Projects")
  const tCommon = useTranslations("Common")

  const columns = useMemo(() => {
    const col = dataTableColumnHelper<Row>()
    return [
      col.accessor("name", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.name")} />,
        cell: ({ row }) => <NameCell name={row.original.name} slug={row.original.slug} />,
      }),
      col.accessor("category", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.category")} />,
        cell: ({ row }) => row.original.category,
        meta: { className: "w-36" },
      }),
      col.display({
        id: "picture",
        header: () => t("columns.picture"),
        cell: ({ row }) => <PictureCell image={row.original.image} alt={row.original.name} />,
        meta: { className: "w-32" },
      }),
      col.accessor("has_detail", {
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.caseStudy")} />,
        cell: ({ row }) => <YesNo value={row.original.has_detail} />,
        meta: { className: "w-32" },
      }),
    ]
  }, [t])

  return (
    <CollectionTable
      resource={projectsResource}
      basePath={adminPaths.work}
      nameOf={(row) => row.name}
      columns={columns}
      exportName="projects"
      exportTitle={t("title")}
      exportColumns={[
        { header: t("columns.name"), value: (row) => row.name },
        { header: t("columns.slug"), value: (row) => row.slug, dir: "ltr" },
        { header: t("columns.category"), value: (row) => row.category },
        { header: t("columns.summary"), value: (row) => row.summary },
        { header: t("columns.picture"), value: (row) => row.image?.src ?? "", type: "image" },
        { header: t("columns.caseStudy"), value: (row) => (row.has_detail ? tCommon("yes") : tCommon("no")) },
      ]}
      facets={[
        {
          key: "detail",
          title: t("columns.caseStudy"),
          options: [
            { value: "yes", label: tCommon("yes") },
            { value: "no", label: tCommon("no") },
          ],
        },
      ]}
      newLabel={t("new")}
      previewPath={projectPreviewPath}
    />
  )
}
