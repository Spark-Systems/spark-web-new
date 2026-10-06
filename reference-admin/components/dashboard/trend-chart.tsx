"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { TimeseriesPoint } from "@/lib/analytics/types"

// Dates arrive as YYYY-MM-DD; parse at UTC midnight and format in UTC so the
// label never shifts a day with the viewer's time zone.
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`)

export function TrendChart({ data, dir }: { data: TimeseriesPoint[]; dir: "ltr" | "rtl" }) {
  const t = useTranslations("Dashboard.trend")
  const format = useFormatter()
  const rtl = dir === "rtl"

  const config = { activeUsers: { label: t("title"), color: "var(--chart-1)" } } satisfies ChartConfig
  const formatDay = (iso: string, long = false) =>
    format.dateTime(toDate(iso), {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      ...(long && { weekday: "short", year: "numeric" }),
    })

  return (
    <>
      <ChartContainer config={config} className="aspect-auto h-[260px] w-full [&_svg]:[direction:ltr]">
        <AreaChart data={data} margin={{ top: 8, left: 4, right: 4 }}>
          <defs>
            <linearGradient id="fill-active-users" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-activeUsers)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--color-activeUsers)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            reversed={rtl}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value: string) => formatDay(value)}
          />
          <YAxis
            orientation={rtl ? "right" : "left"}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width="auto"
            allowDecimals={false}
            tickCount={4}
            tickFormatter={(value: number) => format.number(value, { notation: "compact" })}
          />
          <ChartTooltip
            cursor={{ strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) => {
                  const iso = payload?.[0]?.payload?.date
                  return typeof iso === "string" ? formatDay(iso, true) : null
                }}
              />
            }
          />
          <Area
            dataKey="activeUsers"
            type="monotone"
            stroke="var(--color-activeUsers)"
            strokeWidth={2}
            fill="url(#fill-active-users)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>

      {/* Same data as a table for screen readers. */}
      <table className="sr-only">
        <caption>{t("description")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("date")}</th>
            <th scope="col">{t("title")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{formatDay(point.date, true)}</td>
              <td>{format.number(point.activeUsers)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
