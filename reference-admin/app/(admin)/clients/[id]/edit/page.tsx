import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditLogoItem } from "@/components/logo-items/edit-logo-item"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Clients")
  return { title: t("editTitle") }
}

export default async function EditClientPage({ params }: PageProps<"/clients/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Clients")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditLogoItem kind="clients" id={id} />
    </div>
  )
}
