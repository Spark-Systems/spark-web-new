"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { siteServicesQueries } from "@/lib/api/services/site-services"
import { ServiceForm } from "./service-form"

/** Loads the service (tokens live client-side), then shows the shared form. */
export function EditService({ id }: { id: string }) {
  const t = useTranslations("Services")
  const { data, isPending, isError, error, refetch } = useQuery(siteServicesQueries.detail(id))

  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return <ServiceForm service={data} />
}
