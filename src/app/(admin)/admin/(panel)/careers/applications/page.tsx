import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { ApplicationsTable } from "@admin/components/careers/applications-table"
import { PageHeader } from "@admin/components/layout/page-header"
import { ListingNav } from "@admin/components/pages/listing-nav"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Applications")
  return { title: t("title") }
}

export default async function ApplicationsPage() {
  const t = await getTranslations("Applications")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ListingNav section="careers" />
      <Suspense>
        <ApplicationsTable />
      </Suspense>
    </div>
  )
}
