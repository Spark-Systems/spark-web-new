import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { ProductForm } from "@/components/products/product-form"
import { PageHeader } from "@/components/layout/page-header"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Products")
  return { title: t("newTitle") }
}

export default async function NewProductPage() {
  const t = await getTranslations("Products")
  const crumbs = [{ label: t("newTitle") }]

  return (
    // The form reads ?tab= with useSearchParams, which needs Suspense.
    <Suspense fallback={<PageHeader title={t("newTitle")} crumbs={crumbs} />}>
      <ProductForm title={t("newTitle")} crumbs={crumbs} />
    </Suspense>
  )
}
