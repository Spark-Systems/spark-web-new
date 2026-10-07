import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { InsightsTable } from "@admin/components/insights/insights-table"
import { PageHeader } from "@admin/components/layout/page-header"
import { ListingNav } from "@admin/components/pages/listing-nav"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Insights")
  return { title: t("title") }
}

export default async function InsightsPage() {
  const t = await getTranslations("Insights")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ListingNav section="insights" />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <InsightsTable />
      </Suspense>
    </div>
  )
}
