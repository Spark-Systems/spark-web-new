import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditHomeBanner } from "@/components/home/edit-home-banner"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomeBanners")
  return { title: t("editTitle") }
}

export default async function EditHomeBannerPage({ params }: PageProps<"/home/banner/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("HomeBanners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditHomeBanner id={id} />
    </div>
  )
}
