import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditCountry } from "@/components/countries/edit-country"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Countries")
  return { title: t("editTitle") }
}

export default async function EditCountryPage({ params }: PageProps<"/settings/countries/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Countries")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditCountry id={id} />
    </div>
  )
}
