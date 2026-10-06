import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { PageHeader } from "@admin/components/layout/page-header"
import { ListingNav } from "@admin/components/pages/listing-nav"
import { ProjectsTable } from "@admin/components/projects/projects-table"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Projects")
  return { title: t("title") }
}

export default async function ProjectsPage() {
  const t = await getTranslations("Projects")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ListingNav section="work" />
      {/* The table keeps its page/sort/search in the URL (useSearchParams needs Suspense). */}
      <Suspense>
        <ProjectsTable />
      </Suspense>
    </div>
  )
}
