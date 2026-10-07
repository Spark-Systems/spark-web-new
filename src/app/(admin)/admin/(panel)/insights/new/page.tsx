import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { InsightEditor } from "@admin/components/insights/insight-editor"
import { PageHeader } from "@admin/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Insights")
  return { title: t("newTitle") }
}

export default async function NewInsightsPage() {
  const t = await getTranslations("Insights")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <InsightEditor />
    </div>
  )
}
