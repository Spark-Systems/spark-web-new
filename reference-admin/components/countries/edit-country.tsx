"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { countriesQueries } from "@/lib/api/services/countries"
import { CountryForm } from "./country-form"

/** Loads the country (tokens live client-side), then shows the shared form. */
export function EditCountry({ id }: { id: string }) {
  const t = useTranslations("Countries")
  const { data, isPending, isError, error, refetch } = useQuery(countriesQueries.detail(id))

  if (isPending) return <Skeleton className="h-96 rounded-xl" />
  if (isError) {
    return isApiError(error) && error.status === 404 ? (
      <QueryError message={t("notFound")} onRetry={() => refetch()} />
    ) : (
      <QueryError message={t("loadError")} onRetry={() => refetch()} />
    )
  }
  return <CountryForm country={data} />
}
