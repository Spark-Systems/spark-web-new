import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { EditLogoItem } from "@admin/components/logo-items/logo-item-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Partners")
  return { title: t("editTitle") }
}

export default async function EditPartnersPage({ params }: PageProps<"/admin/partners/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Partners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditLogoItem kind="partners" id={id} />
    </div>
  )
}
