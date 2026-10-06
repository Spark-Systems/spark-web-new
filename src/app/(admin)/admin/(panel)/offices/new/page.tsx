import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { OfficeEditor } from "@admin/components/offices/office-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Offices")
  return { title: t("newTitle") }
}

export default async function NewOfficesPage() {
  const t = await getTranslations("Offices")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <OfficeEditor />
    </div>
  )
}
