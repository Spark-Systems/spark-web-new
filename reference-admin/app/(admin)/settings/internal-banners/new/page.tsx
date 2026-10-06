import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BannerForm } from "@/components/banners/banner-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Banners")
  return { title: t("newTitle") }
}

export default async function NewBannerPage() {
  const t = await getTranslations("Banners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <BannerForm />
    </div>
  )
}
