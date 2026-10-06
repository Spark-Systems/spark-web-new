import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditBanner } from "@/components/banners/edit-banner"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Banners")
  return { title: t("editTitle") }
}

export default async function EditBannerPage({ params }: PageProps<"/settings/internal-banners/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Banners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditBanner id={id} />
    </div>
  )
}
