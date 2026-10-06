import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { EnquiriesTable } from "@admin/components/enquiries/enquiries-table"
import { PageHeader } from "@admin/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Enquiries")
  return { title: t("title") }
}

export default async function EnquiriesPage() {
  const t = await getTranslations("Enquiries")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense>
        <EnquiriesTable />
      </Suspense>
    </div>
  )
}
