// Calendar-date helpers shared by the client (picker, URL) and the server (GA
// requests). Dates are plain "YYYY-MM-DD" strings, so no time zone ever shifts
// a day; arithmetic runs in UTC for the same reason.

export interface DateRangeValue {
  /** Inclusive start, YYYY-MM-DD. */
  from: string
  /** Inclusive end, YYYY-MM-DD. */
  to: string
}

/** GA4 has no data before this date. */
export const GA_MIN_DATE = "2015-08-14"
/** Upper bound on range length so the daily trend stays a sane size. */
export const MAX_RANGE_DAYS = 731

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000

const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(toUtc(value))
}

/** A Date's calendar day in the viewer's local time zone. */
export function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Local-midnight Date for a calendar day (what the date picker expects). */
export function toLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (iso: string, days: number) => fromUtc(toUtc(iso) + days * DAY_MS)

/** Number of days in the range, both ends included. */
export const rangeLength = ({ from, to }: DateRangeValue) => (toUtc(to) - toUtc(from)) / DAY_MS + 1

export function eachDay(range: DateRangeValue) {
  return Array.from({ length: rangeLength(range) }, (_, i) => addDays(range.from, i))
}

/** The range of equal length that ends the day before `range` starts. */
export function previousPeriod(range: DateRangeValue): DateRangeValue {
  const to = addDays(range.from, -1)
  return { from: addDays(to, -(rangeLength(range) - 1)), to }
}

export function isValidRange(range: Partial<DateRangeValue>, today: string): range is DateRangeValue {
  const { from, to } = range
  if (!isIsoDate(from) || !isIsoDate(to)) return false
  if (from > to || from < GA_MIN_DATE || to > today) return false
  return rangeLength({ from, to }) <= MAX_RANGE_DAYS
}

export const presets = ["last7", "last28", "last90", "thisMonth", "lastMonth"] as const
export type Preset = (typeof presets)[number]

/** "Last N days" end yesterday, like the GA UI, so a partial today doesn't skew them. */
export function presetRange(preset: Preset, today: string): DateRangeValue {
  const yesterday = addDays(today, -1)
  switch (preset) {
    case "last7":
      return { from: addDays(yesterday, -6), to: yesterday }
    case "last28":
      return { from: addDays(yesterday, -27), to: yesterday }
    case "last90":
      return { from: addDays(yesterday, -89), to: yesterday }
    case "thisMonth":
      return { from: `${today.slice(0, 7)}-01`, to: today }
    case "lastMonth": {
      const lastOfPrev = addDays(`${today.slice(0, 7)}-01`, -1)
      return { from: `${lastOfPrev.slice(0, 7)}-01`, to: lastOfPrev }
    }
  }
}

export const defaultPreset: Preset = "last28"

export function matchPreset(range: DateRangeValue, today: string): Preset | null {
  return (
    presets.find((preset) => {
      const candidate = presetRange(preset, today)
      return candidate.from === range.from && candidate.to === range.to
    }) ?? null
  )
}
