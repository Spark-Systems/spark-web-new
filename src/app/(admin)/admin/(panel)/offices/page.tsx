import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { PageHeader } from "@admin/components/layout/page-header"
import { OfficesTable } from "@admin/components/offices/offices-table"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Offices")
  return { title: t("title") }
}

export default async function OfficesPage() {
  const t = await getTranslations("Offices")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <OfficesTable />
      </Suspense>
    </div>
  )
}
