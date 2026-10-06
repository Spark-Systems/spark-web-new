import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { FooterContactForm } from "@/components/home/footer-contact-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FooterContact")
  return { title: t("title") }
}

export default async function FooterContactPage() {
  const t = await getTranslations("FooterContact")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <FooterContactForm />
    </div>
  )
}
