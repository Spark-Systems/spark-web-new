"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface RankedBarItem {
  key: string
  label: string
  value: number
}

const ROW_HEIGHT = 36

/**
 * Horizontal bar chart for one measure across ranked categories (channels,
 * countries, devices). Single series in the brand color; values are printed at
 * the bar tips, with the share of `total` in the tooltip.
 */
export function RankedBarChart({
  items,
  total,
  valueLabel,
  dir,
}: {
  items: RankedBarItem[]
  /** Denominator for the share shown in the tooltip, e.g. total active users. */
  total: number
  valueLabel: string
  dir: "ltr" | "rtl"
}) {
  const t = useTranslations("Dashboard")
  const format = useFormatter()
  const rtl = dir === "rtl"

  if (items.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">{t("empty")}</p>
  }

  const config = { value: { label: valueLabel, color: "var(--chart-1)" } } satisfies ChartConfig
  const share = (value: number) =>
    format.number(total > 0 ? Math.min(value / total, 1) : 0, { style: "percent", maximumFractionDigits: 1 })

  return (
    <ChartContainer
      config={config}
      // SVG geometry is physical; an RTL base direction would flip text anchors
      // and push the axis labels into the bars.
      className="aspect-auto w-full [&_svg]:[direction:ltr]"
      style={{ height: items.length * ROW_HEIGHT + 8 }}
    >
      <BarChart
        data={items}
        layout="vertical"
        // Room past the bar tips for the value labels.
        margin={rtl ? { left: 44, right: 0 } : { left: 0, right: 44 }}
        barCategoryGap={8}
      >
        <XAxis type="number" dataKey="value" hide reversed={rtl} />
        <YAxis
          type="category"
          dataKey="label"
          orientation={rtl ? "right" : "left"}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          width="auto"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              // A custom formatter replaces the whole row, so it renders the category too.
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-col gap-1">
                  <span className="font-medium">{(item.payload as RankedBarItem).label}</span>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{valueLabel}</span>
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      {format.number(Number(value))} · {share(Number(value))}
                    </span>
                  </div>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          barSize={20}
          radius={rtl ? [4, 0, 0, 4] : [0, 4, 4, 0]}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="value"
            // "right" means past the bar tip, also when the axis is reversed.
            position="right"
            offset={8}
            className="fill-foreground tabular-nums"
            fontSize={12}
            formatter={(value: unknown) => format.number(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
