import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PageHeader } from "@admin/components/layout/page-header"
import { ProfileForms } from "@admin/components/profile/profile-forms"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile")
  return { title: t("title") }
}

export default async function ProfilePage() {
  const t = await getTranslations("Profile")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ProfileForms />
    </div>
  )
}
