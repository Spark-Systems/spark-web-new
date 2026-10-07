import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { JobsTable } from "@admin/components/careers/jobs-table"
import { PageHeader } from "@admin/components/layout/page-header"
import { ListingNav } from "@admin/components/pages/listing-nav"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Jobs")
  return { title: t("title") }
}

export default async function CareersPage() {
  const t = await getTranslations("Jobs")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ListingNav section="careers" />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <JobsTable />
      </Suspense>
    </div>
  )
}
