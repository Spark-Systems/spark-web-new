"use client"

import { useQuery } from "@tanstack/react-query"
import { Radio } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { Bar, BarChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@admin/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@admin/components/ui/chart"
import { QueryError } from "@admin/components/query-error"
import { Skeleton } from "@admin/components/ui/skeleton"
import { analyticsQueries } from "@admin/lib/api/services/analytics"
import { CardIcon } from "./card-icon"

export function RealtimeCard({ dir, className }: { dir: "ltr" | "rtl"; className?: string }) {
  const t = useTranslations("Dashboard.realtime")
  const tDashboard = useTranslations("Dashboard")
  const format = useFormatter()
  const { data, isPending, isError, refetch } = useQuery(analyticsQueries.realtime())
  const rtl = dir === "rtl"

  const config = { activeUsers: { label: t("perMinute"), color: "var(--chart-1)" } } satisfies ChartConfig
  // Oldest minute first, so "now" sits at the reading end of the axis.
  const points = data?.perMinute.map((activeUsers, minutesAgo) => ({ minutesAgo, activeUsers })).reverse()
  const live = (data?.activeUsers ?? 0) > 0

  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-3">
        <CardIcon icon={Radio} />
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            {t("title")}
            <span className="relative flex size-2">
              {live && (
                <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden" />
              )}
              <span className={live ? "bg-primary relative size-2 rounded-full" : "bg-muted-foreground/40 relative size-2 rounded-full"} />
            </span>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isError ? (
          <QueryError message={tDashboard("loadError")} onRetry={() => refetch()} />
        ) : isPending || !points ? (
          <>
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : (
          <>
            <p className="text-5xl font-semibold">{format.number(data.activeUsers)}</p>
            <ChartContainer config={config} className="mt-auto aspect-auto h-40 w-full [&_svg]:[direction:ltr]">
              <BarChart data={points} margin={{ top: 4, left: 0, right: 0 }} barCategoryGap={2}>
                <XAxis
                  dataKey="minutesAgo"
                  reversed={rtl}
                  tickLine={false}
                  axisLine
                  tickMargin={8}
                  ticks={[29, 15, 0]}
                  tickFormatter={(value: number) => t("minutesAgoShort", { count: value })}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_, payload) => {
                        const minutesAgo = payload?.[0]?.payload?.minutesAgo
                        return typeof minutesAgo === "number" ? t("minutesAgo", { count: minutesAgo }) : null
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="activeUsers"
                  fill="var(--color-activeUsers)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
