import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { UserForm } from "@admin/components/users/user-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Users")
  return { title: t("newTitle") }
}

export default async function NewUserPage() {
  const t = await getTranslations("Users")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <UserForm />
    </div>
  )
}
