import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LogoItemForm } from "@/components/logo-items/logo-item-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Clients")
  return { title: t("newTitle") }
}

export default async function NewClientPage() {
  const t = await getTranslations("Clients")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <LogoItemForm kind="clients" />
    </div>
  )
}
