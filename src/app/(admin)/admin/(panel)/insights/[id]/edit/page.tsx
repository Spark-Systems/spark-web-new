import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditInsight } from "@admin/components/insights/insight-editor"
import { PageHeader } from "@admin/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Insights")
  return { title: t("editTitle") }
}

export default async function EditInsightsPage({ params }: PageProps<"/admin/insights/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Insights")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditInsight id={id} />
    </div>
  )
}
