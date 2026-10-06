// Shared between the GA route handlers (server) and the dashboard (client).

import type { DateRangeValue } from "./date-range"

export const kpiKeys = [
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "engagementRate",
  "averageSessionDuration",
] as const
export type KpiKey = (typeof kpiKeys)[number]

export interface KpiValue {
  value: number
  /** Same metric over the preceding period of equal length. */
  previous: number
}

export interface TimeseriesPoint {
  /** ISO date, YYYY-MM-DD. */
  date: string
  activeUsers: number
}

export interface BreakdownRow {
  /** Raw GA dimension value, e.g. "Organic Search" or "desktop". */
  key: string
  value: number
}

export interface CountryRow extends BreakdownRow {
  /** ISO 3166-1 alpha-2 used to localize the name, or "(not set)". */
  code: string
}

export interface PageRow {
  path: string
  views: number
  users: number
}

export interface AnalyticsOverview {
  range: DateRangeValue
  kpis: Record<KpiKey, KpiValue>
  timeseries: TimeseriesPoint[]
  channels: BreakdownRow[]
  devices: BreakdownRow[]
  countries: CountryRow[]
  pages: PageRow[]
}

export interface RealtimeSnapshot {
  /** Unique users active in the last 30 minutes. */
  activeUsers: number
  /** Active users per minute; index 0 is the current minute, 29 is 29 minutes ago. */
  perMinute: number[]
}
