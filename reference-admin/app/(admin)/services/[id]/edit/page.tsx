import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditService } from "@/components/services/edit-service"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Services")
  return { title: t("editTitle") }
}

export default async function EditServicePage({ params }: PageProps<"/services/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Services")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditService id={id} />
    </div>
  )
}
