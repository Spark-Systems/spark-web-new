"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { productCategoriesQueries } from "@/lib/api/services/product-categories"
import { CategoryForm } from "./category-form"

/** Loads the category (tokens live client-side), then shows the shared form. */
export function EditCategory({ id }: { id: string }) {
  const t = useTranslations("ProductCategories")
  const { data, isPending, isError, error, refetch } = useQuery(productCategoriesQueries.detail(id))

  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return <CategoryForm category={data} />
}
