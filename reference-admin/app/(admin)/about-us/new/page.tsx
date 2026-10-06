import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { AboutForm } from "@/components/about/about-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutUs")
  return { title: t("newTitle") }
}

export default async function NewAboutSectionPage() {
  const t = await getTranslations("AboutUs")
  const crumbs = [{ label: t("newTitle") }]

  return (
    // The form reads ?tab= with useSearchParams, which needs Suspense.
    <Suspense fallback={<PageHeader title={t("newTitle")} crumbs={crumbs} />}>
      <AboutForm title={t("newTitle")} crumbs={crumbs} />
    </Suspense>
  )
}
