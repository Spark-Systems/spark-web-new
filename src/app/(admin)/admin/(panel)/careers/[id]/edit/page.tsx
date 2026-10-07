import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditJob } from "@admin/components/careers/job-editor"
import { PageHeader } from "@admin/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Jobs")
  return { title: t("editTitle") }
}

export default async function EditCareersPage({ params }: PageProps<"/admin/careers/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Jobs")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditJob id={id} />
    </div>
  )
}
