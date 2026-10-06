import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { LogoItemEditor } from "@admin/components/logo-items/logo-item-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Partners")
  return { title: t("newTitle") }
}

export default async function NewPartnersPage() {
  const t = await getTranslations("Partners")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <LogoItemEditor kind="partners" />
    </div>
  )
}
