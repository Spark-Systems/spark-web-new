"use client"

import { useQuery } from "@tanstack/react-query"

import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { logoItemsConfigs, useLogoItemsT, type LogoItemsKind } from "./config"
import { LogoItemForm } from "./logo-item-form"

/** Loads the entry (tokens live client-side), then shows the shared form. */
export function EditLogoItem({ kind, id }: { kind: LogoItemsKind; id: string }) {
  const config = logoItemsConfigs[kind]
  const t = useLogoItemsT(config)
  const { data, isPending, isError, error, refetch } = useQuery(config.api.queries.detail(id))

  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return <LogoItemForm kind={kind} item={data} />
}
