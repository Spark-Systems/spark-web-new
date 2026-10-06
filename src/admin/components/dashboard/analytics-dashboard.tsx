"use client"

import { useQuery } from "@tanstack/react-query"
import { ChartSpline, FileText, Globe, MonitorSmartphone, Share2, type LucideIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFormatter, useLocale, useMessages, useTranslations } from "next-intl"
import { useMemo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@admin/components/ui/card"
import { QueryError } from "@admin/components/query-error"
import { Skeleton } from "@admin/components/ui/skeleton"
import { useToday } from "@admin/hooks/use-client-date"
import { getDirection } from "@admin/i18n/config"
import {
  defaultPreset,
  isValidRange,
  presetRange,
  toLocalDate,
  type DateRangeValue,
} from "@admin/lib/analytics/date-range"
import { analyticsQueries } from "@admin/lib/api/services/analytics"
import { cn } from "@admin/lib/utils"
import { CardIcon } from "./card-icon"
import { DateRangePicker } from "./date-range-picker"
import { KpiCards } from "./kpi-cards"
import { RankedBarChart } from "./ranked-bar-chart"
import { RealtimeCard } from "./realtime-card"
import { DonutChart, RadialChart, toSlices } from "./share-charts"
import { TopPages } from "./top-pages"
import { TrendChart } from "./trend-chart"

function ChartCard({
  title,
  description,
  icon,
  className,
  children,
}: {
  title: string
  description: string
  icon: LucideIcon
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-3">
        <CardIcon icon={icon} />
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[360px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const today = useToday()
  if (!today) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <DashboardSkeleton />
      </div>
    )
  }
  return <Dashboard today={today} />
}

function Dashboard({ today }: { today: string }) {
  const t = useTranslations("Dashboard")
  const format = useFormatter()
  const locale = useLocale()
  const dir = getDirection(locale)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const requested = { from: searchParams.get("from") ?? undefined, to: searchParams.get("to") ?? undefined }
  const range: DateRangeValue = isValidRange(requested, today)
    ? requested
    : presetRange(defaultPreset, today)

  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery(
    analyticsQueries.overview(range)
  )

  const setRange = (next: DateRangeValue) => {
    const params = new URLSearchParams(searchParams)
    params.set("from", next.from)
    params.set("to", next.to)
    router.replace(`${pathname}?${params}`, { scroll: false })
  }

  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale])
  const countryLabel = (code: string, name: string) => {
    if (code === "(not set)" || name === "(not set)") return t("notSet")
    // DisplayNames throws on anything that isn't a region code.
    return (/^[A-Z]{2}$/.test(code) && regionNames.of(code)) || name
  }
  // GA returns English dimension values; translate the known ones, show the rest as-is.
  const { channelNames, deviceNames } = useMessages().Dashboard as {
    channelNames: Record<string, string>
    deviceNames: Record<string, string>
  }
  const otherLabel = (key: string) => (key === "(not set)" ? t("notSet") : key)

  const valueLabel = t("kpis.activeUsers")
  const rangeText = data
    ? format.dateTimeRange(toLocalDate(data.range.from), toLocalDate(data.range.to), {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker value={range} today={today} onChange={setRange} />
      </div>

      {isError && !data ? (
        <QueryError message={t("loadError")} onRetry={() => refetch()} />
      ) : isPending ? (
        <DashboardSkeleton />
      ) : (
        // While a new range loads, the previous numbers stay put, dimmed.
        <div
          aria-busy={isPlaceholderData}
          className={cn("flex flex-col gap-4 transition-opacity", isPlaceholderData && "opacity-60")}
        >
          <KpiCards kpis={data.kpis} />

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title={t("trend.title")}
              description={`${t("trend.description")} · ${rangeText}`}
              icon={ChartSpline}
              className="lg:col-span-2"
            >
              <TrendChart data={data.timeseries} dir={dir} />
            </ChartCard>
            <RealtimeCard dir={dir} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title={t("channels.title")} description={t("channels.description")} icon={Share2}>
              <DonutChart
                dir={dir}
                slices={toSlices(
                  data.channels.map((row) => ({
                    key: row.key,
                    label: channelNames[row.key] ?? otherLabel(row.key),
                    value: row.value,
                  })),
                  t("other")
                )}
              />
            </ChartCard>
            <ChartCard title={t("countries.title")} description={t("countries.description")} icon={Globe}>
              <RankedBarChart
                dir={dir}
                valueLabel={valueLabel}
                total={data.kpis.activeUsers.value}
                items={data.countries.map((row) => ({
                  key: row.code || row.key,
                  label: countryLabel(row.code, row.key),
                  value: row.value,
                }))}
              />
            </ChartCard>
            <ChartCard
              title={t("devices.title")}
              description={t("devices.description")}
              icon={MonitorSmartphone}
            >
              <RadialChart
                dir={dir}
                slices={toSlices(
                  data.devices.map((row) => ({
                    key: row.key,
                    label: deviceNames[row.key] ?? otherLabel(row.key),
                    value: row.value,
                  })),
                  t("other")
                )}
              />
            </ChartCard>
          </div>

          <ChartCard title={t("pages.title")} description={t("pages.description")} icon={FileText}>
            <TopPages pages={data.pages} />
          </ChartCard>
        </div>
      )}
    </div>
  )
}
