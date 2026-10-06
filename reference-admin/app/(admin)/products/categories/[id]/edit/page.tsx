import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EditCategory } from "@/components/product-categories/edit-category"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProductCategories")
  return { title: t("editTitle") }
}

export default async function EditCategoryPage({ params }: PageProps<"/products/categories/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("ProductCategories")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("editTitle")} crumbs={[{ label: t("editTitle") }]} />
      <EditCategory id={id} />
    </div>
  )
}
