import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ServiceForm } from "@/components/services/service-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Services")
  return { title: t("newTitle") }
}

export default async function NewServicePage() {
  const t = await getTranslations("Services")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <ServiceForm />
    </div>
  )
}
