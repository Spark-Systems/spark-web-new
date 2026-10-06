import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { CategoryForm } from "@/components/product-categories/category-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProductCategories")
  return { title: t("newTitle") }
}

export default async function NewCategoryPage() {
  const t = await getTranslations("ProductCategories")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} crumbs={[{ label: t("newTitle") }]} />
      <CategoryForm />
    </div>
  )
}
