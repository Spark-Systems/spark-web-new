import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { ListingNav } from "@admin/components/pages/listing-nav"
import { SolutionsPageEditor } from "@admin/components/pages/listing-page-editors"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Solutions")
  return { title: t("pageTitle") }
}

export default async function SolutionsCopyPage() {
  const t = await getTranslations("Solutions")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <ListingNav section="solutions" />
      <SolutionsPageEditor />
    </div>
  )
}
