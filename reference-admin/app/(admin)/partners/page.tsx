import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { LogoItemsTable } from "@/components/logo-items/logo-items-table"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Partners")
  return { title: t("title") }
}

export default async function PartnersPage() {
  const t = await getTranslations("Partners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <LogoItemsTable kind="partners" />
      </Suspense>
    </div>
  )
}
