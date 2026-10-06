"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { homeBannersQueries } from "@/lib/api/services/home"
import { HomeBannerForm } from "./home-banner-form"

/** Loads the slide (tokens live client-side), then shows the shared form. */
export function EditHomeBanner({ id }: { id: string }) {
  const t = useTranslations("HomeBanners")
  const { data, isPending, isError, error, refetch } = useQuery(homeBannersQueries.detail(id))

  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return <HomeBannerForm banner={data} />
}
