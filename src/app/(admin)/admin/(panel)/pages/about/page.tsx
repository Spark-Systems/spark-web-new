import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { AboutEditor } from "@admin/components/pages/about-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages")
  return { title: t("about.title") }
}

export default async function AboutEditorPage() {
  const t = await getTranslations("Pages")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("about.title")} description={t("about.description")} />
      <AboutEditor />
    </div>
  )
}
