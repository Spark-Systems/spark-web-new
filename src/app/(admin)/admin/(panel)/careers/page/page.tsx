import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { ListingNav } from "@admin/components/pages/listing-nav"
import { CareersPageEditor } from "@admin/components/pages/listing-page-editors"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Jobs")
  return { title: t("pageTitle") }
}

export default async function CareersCopyPage() {
  const t = await getTranslations("Jobs")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <ListingNav section="careers" />
      <CareersPageEditor />
    </div>
  )
}
