"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@admin/components/query-error"
import { Skeleton } from "@admin/components/ui/skeleton"
import { isApiError } from "@admin/lib/api/errors"
import { siteServicesResource } from "@admin/lib/api/services/site-content"
import { ServiceForm } from "./service-form"

/** Loads the service (tokens live client-side), then shows the shared form. */
export function EditService({ id }: { id: string }) {
  const t = useTranslations("Services")
  const { data, isPending, isError, error, refetch } = useQuery(siteServicesResource.queries.detail(id))

  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return <ServiceForm service={data} />
}
