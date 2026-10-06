import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { PageHeader } from "@admin/components/layout/page-header"
import { ConfigurationTabs } from "@admin/components/settings/configuration-tabs"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Configuration")
  return { title: t("title") }
}

export default async function ConfigurationPage() {
  const t = await getTranslations("Configuration")

  return (
    // The ?tab= query string is read with useSearchParams, which needs Suspense;
    // the header shows on its own until the tabs are ready.
    <Suspense fallback={<PageHeader title={t("title")} description={t("description")} />}>
      <ConfigurationTabs title={t("title")} description={t("description")} />
    </Suspense>
  )
}
