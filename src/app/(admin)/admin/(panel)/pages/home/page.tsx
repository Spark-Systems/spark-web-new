import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { HomeEditor } from "@admin/components/pages/home-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages")
  return { title: t("home.title") }
}

export default async function HomeEditorPage() {
  const t = await getTranslations("Pages")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("home.title")} description={t("home.description")} />
      <HomeEditor />
    </div>
  )
}
