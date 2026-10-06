import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { EditProduct } from "@/components/products/edit-product"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Products")
  return { title: t("editTitle") }
}

export default async function EditProductPage({ params }: PageProps<"/products/list/[id]/edit">) {
  const { id } = await params
  const t = await getTranslations("Products")
  const crumbs = [{ label: t("editTitle") }]

  return (
    // The form reads ?tab= with useSearchParams, which needs Suspense.
    <Suspense fallback={<PageHeader title={t("editTitle")} crumbs={crumbs} />}>
      <EditProduct id={id} title={t("editTitle")} crumbs={crumbs} />
    </Suspense>
  )
}
