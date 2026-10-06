import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { WelcomeMessageForm } from "@/components/home/welcome-message-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WelcomeMessage")
  return { title: t("title") }
}

export default async function WelcomeMessagePage() {
  const t = await getTranslations("WelcomeMessage")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <WelcomeMessageForm />
    </div>
  )
}
