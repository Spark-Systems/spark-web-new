import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { ProjectEditor } from "@admin/components/projects/project-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Projects")
  return { title: t("newTitle") }
}

export default async function NewProjectsPage() {
  const t = await getTranslations("Projects")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <ProjectEditor />
    </div>
  )
}
