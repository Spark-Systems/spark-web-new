"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { QueryError } from "@/components/query-error"
import type { Crumb } from "@/components/layout/app-breadcrumb"
import { PageHeader } from "@/components/layout/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { aboutQueries } from "@/lib/api/services/about"
import { AboutForm } from "./about-form"

/** Loads the section (tokens live client-side), then shows the shared form. */
export function EditAboutSection({ id, title, crumbs }: { id: string; title: string; crumbs?: Crumb[] }) {
  const t = useTranslations("AboutUs")
  const { data, isPending, isError, error, refetch } = useQuery(aboutQueries.detail(id))

  if (isPending || isError) {
    const notFound = isError && isApiError(error) && error.status === 404
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={title} crumbs={crumbs} />
        {isPending ? (
          <Skeleton className="h-[480px] rounded-xl" />
        ) : (
          <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
        )}
      </div>
    )
  }
  return <AboutForm section={data} title={title} crumbs={crumbs} />
}
