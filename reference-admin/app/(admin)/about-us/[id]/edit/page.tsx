import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { EditAboutSection } from "@/components/about/edit-about-section"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutUs")
  return { title: t("editTitle") }
}

export default async function EditAboutSectionPage({ params }: PageProps<"/about-us/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("AboutUs")
  const crumbs = [{ label: t("editTitle") }]

  return (
    // The form reads ?tab= with useSearchParams, which needs Suspense.
    <Suspense fallback={<PageHeader title={t("editTitle")} crumbs={crumbs} />}>
      <EditAboutSection id={id} title={t("editTitle")} crumbs={crumbs} />
    </Suspense>
  )
}
