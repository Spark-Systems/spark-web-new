import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { EditSolution } from "@admin/components/solutions/solution-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Solutions")
  return { title: t("editTitle") }
}

export default async function EditSolutionsPage({ params }: PageProps<"/admin/solutions/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Solutions")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditSolution id={id} />
    </div>
  )
}
