import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { EditProject } from "@admin/components/projects/project-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Projects")
  return { title: t("editTitle") }
}

export default async function EditProjectsPage({ params }: PageProps<"/admin/work/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Projects")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditProject id={id} />
    </div>
  )
}
