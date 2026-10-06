import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { SolutionEditor } from "@admin/components/solutions/solution-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Solutions")
  return { title: t("newTitle") }
}

export default async function NewSolutionsPage() {
  const t = await getTranslations("Solutions")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <SolutionEditor />
    </div>
  )
}
