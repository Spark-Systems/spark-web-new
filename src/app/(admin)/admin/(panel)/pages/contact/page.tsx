import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { ContactEditor } from "@admin/components/pages/contact-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages")
  return { title: t("contact.title") }
}

export default async function ContactEditorPage() {
  const t = await getTranslations("Pages")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("contact.title")} description={t("contact.description")} />
      <ContactEditor />
    </div>
  )
}
