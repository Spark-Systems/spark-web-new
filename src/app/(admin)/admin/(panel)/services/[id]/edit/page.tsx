import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { EditService } from "@admin/components/services/service-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Services")
  return { title: t("editTitle") }
}

export default async function EditServicesPage({ params }: PageProps<"/admin/services/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Services")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditService id={id} />
    </div>
  )
}
