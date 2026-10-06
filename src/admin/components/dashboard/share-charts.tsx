"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@admin/components/ui/chart"

// Part-to-whole charts (donut, radial) share one categorical palette: brand red,
// ink, mid gray, light gray (--chart-1..4). It was validated so every adjacent
// pair, including the donut's last-to-first wrap, stays distinct for color-blind
// readers. Four slots is the cap, so longer lists fold their tail into "Other".
const MAX_SLICES = 4

export interface ShareInput {
  key: string
  label: string
  value: number
}

export interface ShareSlice {
  /** Safe CSS identifier (s0..s3) for the chart config; labels can contain spaces. */
  id: string
  label: string
  value: number
  /** Global token, so legends outside the chart container can use it too. */
  fill: string
}

/** Keeps the top entries and folds the rest into a single "Other" slice. */
export function toSlices(items: ShareInput[], otherLabel: string): ShareSlice[] {
  const kept =
    items.length > MAX_SLICES
      ? [
          ...items.slice(0, MAX_SLICES - 1),
          {
            key: "__other",
            label: otherLabel,
            value: items.slice(MAX_SLICES - 1).reduce((sum, item) => sum + item.value, 0),
          },
        ]
      : items
  return kept.map((item, i) => ({
    id: `s${i}`,
    label: item.label,
    value: item.value,
    fill: `var(--chart-${i + 1})`,
  }))
}

function useShareFormat(slices: ShareSlice[]) {
  const format = useFormatter()
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const percent = (value: number) =>
    format.number(total > 0 ? value / total : 0, { style: "percent", maximumFractionDigits: 1 })
  return { format, total, percent }
}

function sliceConfig(slices: ShareSlice[]): ChartConfig {
  return Object.fromEntries(
    slices.map((slice, i) => [slice.id, { label: slice.label, color: `var(--chart-${i + 1})` }])
  )
}

/** Legend that also prints every value, so no reading depends on color or hover. */
function ShareLegend({ slices }: { slices: ShareSlice[] }) {
  const { format, percent } = useShareFormat(slices)

  return (
    <ul className="flex w-full min-w-0 flex-col gap-2.5 text-sm">
      {slices.map((slice) => (
        <li key={slice.id} className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: slice.fill }} />
          <span className="truncate">{slice.label}</span>
          <span className="ms-auto font-medium tabular-nums">{format.number(slice.value)}</span>
          <span className="text-muted-foreground w-12 text-end text-xs tabular-nums">
            {percent(slice.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function SliceTooltip({ slices }: { slices: ShareSlice[] }) {
  const { format, percent } = useShareFormat(slices)

  return (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent
          hideLabel
          nameKey="id"
          formatter={(value, _name, item) => {
            const slice = item.payload as ShareSlice
            return (
              <div className="flex w-full items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: slice.fill }} />
                <span className="text-muted-foreground">{slice.label}</span>
                <span className="text-foreground ms-auto ps-3 font-mono font-medium tabular-nums">
                  {format.number(Number(value))} · {percent(Number(value))}
                </span>
              </div>
            )
          }}
        />
      }
    />
  )
}

function Empty() {
  const t = useTranslations("Dashboard")
  return <p className="text-muted-foreground py-6 text-center text-sm">{t("empty")}</p>
}

const layout = "flex flex-col items-center gap-6 sm:flex-row lg:flex-col 2xl:flex-row"

// Angles run clockwise from 12 o'clock in LTR and counter-clockwise in RTL.
const angles = (dir: "ltr" | "rtl") => ({ startAngle: 90, endAngle: dir === "rtl" ? 450 : -270 })

export function DonutChart({ slices, dir }: { slices: ShareSlice[]; dir: "ltr" | "rtl" }) {
  const t = useTranslations("Dashboard")
  const { format, total } = useShareFormat(slices)
  if (slices.length === 0) return <Empty />

  return (
    <div className={layout}>
      <div className="relative size-44 shrink-0">
        <ChartContainer config={sliceConfig(slices)} className="aspect-square size-full [&_svg]:[direction:ltr]">
          <PieChart>
            <SliceTooltip slices={slices} />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="id"
              innerRadius="64%"
              outerRadius="100%"
              {...angles(dir)}
              // 2px surface gap between slices instead of a drawn border.
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{format.number(total)}</span>
          <span className="text-muted-foreground text-xs">{t("totalUsers")}</span>
        </div>
      </div>
      <ShareLegend slices={slices} />
    </div>
  )
}

export function RadialChart({ slices, dir }: { slices: ShareSlice[]; dir: "ltr" | "rtl" }) {
  const { total } = useShareFormat(slices)
  if (slices.length === 0) return <Empty />

  return (
    <div className={layout}>
      <ChartContainer
        config={sliceConfig(slices)}
        className="aspect-square size-44 shrink-0 [&_svg]:[direction:ltr]"
      >
        {/* Recharts draws the first entry innermost; reverse so the largest ring is outside. */}
        <RadialBarChart data={[...slices].reverse()} innerRadius="28%" outerRadius="100%" barSize={14} {...angles(dir)}>
          <PolarAngleAxis type="number" domain={[0, total || 1]} tick={false} axisLine={false} />
          <SliceTooltip slices={slices} />
          <RadialBar
            dataKey="value"
            background={{ fill: "var(--muted)" }}
            cornerRadius={7}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ChartContainer>
      <ShareLegend slices={slices} />
    </div>
  )
}
