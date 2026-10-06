"use client"

import {
  Eye,
  Gauge,
  Minus,
  MousePointerClick,
  Timer,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { Card, CardContent } from "@admin/components/ui/card"
import { kpiKeys, type KpiKey, type KpiValue } from "@admin/lib/analytics/types"
import { cn } from "@admin/lib/utils"

type Formatter = ReturnType<typeof useFormatter>

const kpiIcons: Record<KpiKey, LucideIcon> = {
  activeUsers: Users,
  newUsers: UserPlus,
  sessions: MousePointerClick,
  screenPageViews: Eye,
  engagementRate: Gauge,
  averageSessionDuration: Timer,
}

function formatKpi(key: KpiKey, value: number, format: Formatter) {
  if (key === "engagementRate") {
    return format.number(value, { style: "percent", maximumFractionDigits: 1 })
  }
  if (key === "averageSessionDuration") {
    const minutes = Math.floor(value / 60)
    const seconds = Math.round(value % 60)
    const unit = (n: number, u: "minute" | "second") =>
      format.number(n, { style: "unit", unit: u, unitDisplay: "narrow" })
    return minutes > 0 ? `${unit(minutes, "minute")} ${unit(seconds, "second")}` : unit(seconds, "second")
  }
  return format.number(value, value >= 10_000 ? { notation: "compact", maximumFractionDigits: 1 } : {})
}

function KpiCard({ kpi, value }: { kpi: KpiKey; value: KpiValue }) {
  const t = useTranslations("Dashboard")
  const format = useFormatter()
  const Icon = kpiIcons[kpi]

  // Every KPI here is "higher is better", so only a drop is flagged.
  const change = value.previous > 0 ? (value.value - value.previous) / value.previous : null
  const TrendIcon = change === null || change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-muted-foreground truncate text-sm">{t(`kpis.${kpi}`)}</span>
          <span className="text-2xl leading-none font-semibold">{formatKpi(kpi, value.value, format)}</span>
          <span
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              change !== null && change < 0 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <TrendIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {change === null
                ? t("noPrevious")
                : t("vsPrevious", {
                    change: format.number(change, {
                      style: "percent",
                      signDisplay: "exceptZero",
                      maximumFractionDigits: 1,
                    }),
                  })}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCards({ kpis }: { kpis: Record<KpiKey, KpiValue> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {kpiKeys.map((kpi) => (
        <KpiCard key={kpi} kpi={kpi} value={kpis[kpi]} />
      ))}
    </div>
  )
}
