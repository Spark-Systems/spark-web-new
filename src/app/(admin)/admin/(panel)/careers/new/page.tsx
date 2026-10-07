import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { JobEditor } from "@admin/components/careers/job-editor"
import { PageHeader } from "@admin/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Jobs")
  return { title: t("newTitle") }
}

export default async function NewCareersPage() {
  const t = await getTranslations("Jobs")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <JobEditor />
    </div>
  )
}
