import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { CountriesTable } from "@/components/countries/countries-table"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Countries")
  return { title: t("title") }
}

export default async function CountriesPage() {
  const t = await getTranslations("Countries")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <CountriesTable />
      </Suspense>
    </div>
  )
}
