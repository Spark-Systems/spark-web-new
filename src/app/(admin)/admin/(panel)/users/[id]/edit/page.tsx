import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { EditUser } from "@admin/components/users/user-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Users")
  return { title: t("editTitle") }
}

export default async function EditUserPage({ params }: PageProps<"/admin/users/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Users")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditUser id={id} />
    </div>
  )
}
