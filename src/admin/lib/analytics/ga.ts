import "server-only"

import { BetaAnalyticsDataClient, protos } from "@google-analytics/data"

import { eachDay, previousPeriod, type DateRangeValue } from "./date-range"
import {
  kpiKeys,
  type AnalyticsOverview,
  type BreakdownRow,
  type CountryRow,
  type KpiKey,
  type KpiValue,
  type PageRow,
  type RealtimeSnapshot,
} from "./types"

type RunReportRequest = protos.google.analytics.data.v1beta.IRunReportRequest
type ReportRow = protos.google.analytics.data.v1beta.IRow

export class AnalyticsNotConfiguredError extends Error {
  constructor() {
    super("Google Analytics is not configured (GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY).")
  }
}

// ---- Client -----------------------------------------------------------------

let client: BetaAnalyticsDataClient | null = null

function getClient() {
  const { GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY } = process.env
  if (!GA_PROPERTY_ID || !GA_CLIENT_EMAIL || !GA_PRIVATE_KEY) throw new AnalyticsNotConfiguredError()

  client ??= new BetaAnalyticsDataClient({
    credentials: {
      client_email: GA_CLIENT_EMAIL,
      // Hosts that store the key on one line keep "\n" escaped.
      private_key: GA_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
  })
  return { client, property: `properties/${GA_PROPERTY_ID}` }
}

// ---- Cache ------------------------------------------------------------------
// GA quotas are per property, so identical requests from different admins share
// one result for a few minutes instead of each costing quota.

const cache = new Map<string, { expires: number; value: Promise<unknown> }>()

function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>

  const value = load()
  cache.set(key, { expires: Date.now() + ttlMs, value })
  // Don't keep failures around.
  value.catch(() => cache.delete(key))
  return value
}

// ---- Helpers ----------------------------------------------------------------

const gaRange = ({ from, to }: DateRangeValue) => ({ startDate: from, endDate: to })

async function runReport(request: Omit<RunReportRequest, "property">) {
  const { client, property } = getClient()
  const [response] = await client.runReport({ property, ...request })
  return response.rows ?? []
}

const dim = (row: ReportRow, i = 0) => row.dimensionValues?.[i]?.value ?? ""
const metric = (row: ReportRow, i = 0) => Number(row.metricValues?.[i]?.value ?? 0)

function isoDate(gaDate: string) {
  return `${gaDate.slice(0, 4)}-${gaDate.slice(4, 6)}-${gaDate.slice(6, 8)}`
}

// ---- Reports ----------------------------------------------------------------

async function getKpis(range: DateRangeValue): Promise<Record<KpiKey, KpiValue>> {
  // With two date ranges GA adds a "dateRange" dimension holding each range's name.
  const rows = await runReport({
    dateRanges: [
      { ...gaRange(range), name: "current" },
      { ...gaRange(previousPeriod(range)), name: "previous" },
    ],
    metrics: kpiKeys.map((name) => ({ name })),
  })
  const currentRow = rows.find((row) => dim(row) === "current")
  const previousRow = rows.find((row) => dim(row) === "previous")

  return Object.fromEntries(
    kpiKeys.map((key, i) => [
      key,
      {
        value: currentRow ? metric(currentRow, i) : 0,
        previous: previousRow ? metric(previousRow, i) : 0,
      },
    ])
  ) as Record<KpiKey, KpiValue>
}

async function getTimeseries(range: DateRangeValue) {
  const rows = await runReport({
    dateRanges: [gaRange(range)],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }],
  })
  // GA omits days with no traffic; fill them so the trend line doesn't skip dates.
  const byDay = new Map(rows.map((row) => [isoDate(dim(row)), metric(row)]))
  return eachDay(range).map((date) => ({ date, activeUsers: byDay.get(date) ?? 0 }))
}

async function getBreakdown(range: DateRangeValue, dimension: string, limit: number): Promise<BreakdownRow[]> {
  const rows = await runReport({
    dateRanges: [gaRange(range)],
    dimensions: [{ name: dimension }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit,
  })
  return rows.map((row) => ({ key: dim(row), value: metric(row) }))
}

async function getCountries(range: DateRangeValue): Promise<CountryRow[]> {
  const rows = await runReport({
    dateRanges: [gaRange(range)],
    dimensions: [{ name: "countryId" }, { name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 6,
  })
  return rows.map((row) => ({ code: dim(row, 0), key: dim(row, 1), value: metric(row) }))
}

async function getTopPages(range: DateRangeValue): Promise<PageRow[]> {
  const rows = await runReport({
    dateRanges: [gaRange(range)],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 8,
  })
  return rows.map((row) => ({
    path: dim(row),
    views: metric(row, 0),
    users: metric(row, 1),
  }))
}

export function getOverview(range: DateRangeValue): Promise<AnalyticsOverview> {
  return cached(`overview:${range.from}:${range.to}`, 5 * 60_000, async () => {
    const [kpis, timeseries, channels, devices, countries, pages] = await Promise.all([
      getKpis(range),
      getTimeseries(range),
      getBreakdown(range, "sessionDefaultChannelGroup", 6),
      getBreakdown(range, "deviceCategory", 4),
      getCountries(range),
      getTopPages(range),
    ])
    return { range, kpis, timeseries, channels, devices, countries, pages }
  })
}

export function getRealtime(): Promise<RealtimeSnapshot> {
  return cached("realtime", 30_000, async () => {
    const { client, property } = getClient()
    const metrics = [{ name: "activeUsers" }]
    // Unique users over 30 minutes can't be summed from the per-minute rows, so ask for both.
    const [[total], [byMinute]] = await Promise.all([
      client.runRealtimeReport({ property, metrics }),
      client.runRealtimeReport({ property, metrics, dimensions: [{ name: "minutesAgo" }] }),
    ])

    const perMinute = Array.from({ length: 30 }, () => 0)
    for (const row of byMinute.rows ?? []) {
      const minutesAgo = Number(dim(row))
      if (minutesAgo >= 0 && minutesAgo < 30) perMinute[minutesAgo] = metric(row)
    }
    return { activeUsers: Number(total.rows?.[0]?.metricValues?.[0]?.value ?? 0), perMinute }
  })
}
