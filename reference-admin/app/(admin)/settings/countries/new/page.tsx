import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { CountryForm } from "@/components/countries/country-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Countries")
  return { title: t("newTitle") }
}

export default async function NewCountryPage() {
  const t = await getTranslations("Countries")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <CountryForm />
    </div>
  )
}
