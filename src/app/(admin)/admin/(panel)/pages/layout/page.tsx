import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { LayoutEditor } from "@admin/components/pages/layout-editor"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages")
  return { title: t("layout.title") }
}

export default async function LayoutEditorPage() {
  const t = await getTranslations("Pages")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("layout.title")} description={t("layout.description")} />
      <LayoutEditor />
    </div>
  )
}
