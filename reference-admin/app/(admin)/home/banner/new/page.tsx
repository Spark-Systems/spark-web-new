import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { HomeBannerForm } from "@/components/home/home-banner-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomeBanners")
  return { title: t("newTitle") }
}

export default async function NewHomeBannerPage() {
  const t = await getTranslations("HomeBanners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <HomeBannerForm />
    </div>
  )
}
