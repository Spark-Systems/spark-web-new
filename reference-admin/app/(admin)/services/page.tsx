import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { ServicesTable } from "@/components/services/services-table"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Services")
  return { title: t("title") }
}

export default async function ServicesPage() {
  const t = await getTranslations("Services")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <ServicesTable />
      </Suspense>
    </div>
  )
}
