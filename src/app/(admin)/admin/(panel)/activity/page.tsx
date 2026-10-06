import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { ActivityTable } from "@admin/components/activity/activity-table"
import { PageHeader } from "@admin/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Activity")
  return { title: t("title") }
}

export default async function ActivityPage() {
  const t = await getTranslations("Activity")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense>
        <ActivityTable />
      </Suspense>
    </div>
  )
}
