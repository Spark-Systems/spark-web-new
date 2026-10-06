"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { bannersQueries } from "@/lib/api/services/banners"
import { BannerForm } from "./banner-form"

/** Loads the banner (tokens live client-side), then shows the shared form. */
export function EditBanner({ id }: { id: string }) {
  const t = useTranslations("Banners")
  const { data, isPending, isError, error, refetch } = useQuery(bannersQueries.detail(id))

  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return <BannerForm banner={data} />
}
