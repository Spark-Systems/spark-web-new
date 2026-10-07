"use client"

import { useQuery } from "@tanstack/react-query"
import { Activity, ArrowRight, ExternalLink, FilePen, Inbox, Plus, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useFormatter, useNow, useTranslations } from "next-intl"

import { PublishStatusBadge } from "@admin/components/cms/publish-status-badge"
import { QueryError } from "@admin/components/query-error"
import { Button } from "@admin/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@admin/components/ui/card"
import { Skeleton } from "@admin/components/ui/skeleton"
import { overviewQueries, type Overview } from "@admin/lib/api/services/records"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { adminPaths } from "@admin/lib/paths"
import { CardIcon } from "./card-icon"

const pagePaths: Record<string, string> = {
  home: adminPaths.home,
  about: adminPaths.about,
  contact: adminPaths.contact,
  layout: adminPaths.layout,
  solutions: adminPaths.solutionsPage,
  services: adminPaths.servicesPage,
  work: adminPaths.workPage,
}

const listPaths: Record<string, string> = {
  solutions: adminPaths.solutions,
  services: adminPaths.services,
  projects: adminPaths.work,
  clients: adminPaths.clients,
  partners: adminPaths.partners,
  offices: adminPaths.offices,
}

type ListKey = "solutions" | "services" | "projects" | "clients" | "partners" | "offices"
type PageKey = "home" | "about" | "contact" | "layout" | "solutions" | "services" | "work"

const hrefOf = (item: Overview["pending"][number]) =>
  item.kind === "page" ? pagePaths[item.resource] : `${listPaths[item.resource]}/${item.id}/edit`

function OverviewCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string
  description?: string
  icon: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center gap-3">
        <CardIcon icon={icon} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

/**
 * Dashboard summary of the website's content: what's waiting to be published,
 * new enquiries, recent activity, list sizes and shortcuts.
 */
export function ContentOverview() {
  const t = useTranslations("Overview")
  const format = useFormatter()
  const now = useNow({ updateInterval: 60_000 })
  const { user } = useAuth()
  const canEdit = user?.role !== "viewer"
  const { data, isPending, isError, refetch } = useQuery(overviewQueries.overview())

  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  if (isPending) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  const pageLabel = (key: string) => t(`pages.${key as PageKey}`)
  const listLabel = (key: string) => t(`lists.${key as ListKey}`)
  const ago = (iso: string) => format.relativeTime(new Date(iso), now)

  return (
    <div className="flex flex-col gap-4">
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={adminPaths.home} />}>
            <FilePen data-icon="inline-start" />
            {t("editHome")}
          </Button>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`${adminPaths.work}/new`} />}>
            <Plus data-icon="inline-start" />
            {t("newProject")}
          </Button>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`${adminPaths.solutions}/new`} />}>
            <Plus data-icon="inline-start" />
            {t("newSolution")}
          </Button>
          <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/" target="_blank" rel="noreferrer" />}>
            <ExternalLink data-icon="inline-start" />
            {t("openWebsite")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Object.entries(data.counts).map(([key, count]) => (
          <Link
            key={key}
            href={listPaths[key]}
            className="bg-card hover:border-primary/40 flex flex-col gap-1 rounded-xl border p-4 transition-colors"
          >
            <span className="text-muted-foreground text-xs">{listLabel(key)}</span>
            <span className="text-2xl font-semibold tabular-nums">{format.number(count.total)}</span>
            <span className="text-muted-foreground text-xs">{t("published", { count: count.published })}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <OverviewCard
          title={t("pendingTitle")}
          description={data.pending.length ? t("pendingDescription", { count: data.pending.length }) : undefined}
          icon={FilePen}
        >
          {data.pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("pendingEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {data.pending.slice(0, 8).map((item) => (
                <li key={`${item.kind}-${item.resource}-${item.id}`}>
                  <Link href={hrefOf(item)} className="hover:bg-muted -mx-2 flex items-center gap-3 rounded-lg px-2 py-2">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {item.kind === "page" ? pageLabel(item.resource) : item.label}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {item.kind === "page" ? t("page") : listLabel(item.resource)} · {ago(item.updated_at)}
                        {item.updated_by ? ` · ${item.updated_by}` : ""}
                      </span>
                    </span>
                    <PublishStatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </OverviewCard>

        <OverviewCard
          title={t("enquiriesTitle")}
          description={t("enquiriesDescription", { count: data.enquiries.new })}
          icon={Inbox}
          action={
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={adminPaths.enquiries} />}>
              {t("viewAll")}
              <ArrowRight className="rtl:rotate-180" data-icon="inline-end" />
            </Button>
          }
        >
          {data.enquiries.latest.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("enquiriesEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {data.enquiries.latest.map((e) => (
                <li key={e.id}>
                  <Link href={adminPaths.enquiries} className="hover:bg-muted -mx-2 flex flex-col rounded-lg px-2 py-2">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{e.name}</span>
                      <span className="text-muted-foreground shrink-0 text-xs">{ago(e.created_at)}</span>
                    </span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">{e.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </OverviewCard>

        <OverviewCard
          title={t("activityTitle")}
          icon={Activity}
          action={
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={adminPaths.activity} />}>
              {t("viewAll")}
              <ArrowRight className="rtl:rotate-180" data-icon="inline-end" />
            </Button>
          }
        >
          {data.activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("activityEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {data.activity.map((a) => (
                <li key={a.id} className="flex flex-col text-sm">
                  <span>
                    <span className="font-medium">{a.user_name}</span>{" "}
                    <span className="text-muted-foreground">{t(`actions.${a.action}`)}</span> {a.label}
                  </span>
                  <span className="text-muted-foreground text-xs">{ago(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </OverviewCard>
      </div>
    </div>
  )
}
