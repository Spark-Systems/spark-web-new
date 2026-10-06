import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard")
  return { title: t("title") }
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("subtitle")} />
      {/* useSearchParams (the ?from=&to= range) needs a Suspense boundary. */}
      <Suspense>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}
