import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { PageHeader } from "@admin/components/layout/page-header"
import { UsersTable } from "@admin/components/users/users-table"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Users")
  return { title: t("title") }
}

export default async function UsersPage() {
  const t = await getTranslations("Users")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense>
        <UsersTable />
      </Suspense>
    </div>
  )
}
