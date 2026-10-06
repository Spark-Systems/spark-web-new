import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { EditOffice } from "@admin/components/offices/office-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Offices")
  return { title: t("editTitle") }
}

export default async function EditOfficesPage({ params }: PageProps<"/admin/offices/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Offices")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditOffice id={id} />
    </div>
  )
}
