import { useSyncExternalStore } from "react"

import { toIsoDate } from "@/lib/analytics/date-range"

// The server's clock and time zone can differ from the viewer's, so anything
// derived from "now" is computed on the client only (null during SSR) to keep
// the server HTML and the first client render identical.

const subscribe = () => () => {}

/** The viewer's local date as YYYY-MM-DD, or null during SSR. */
export function useToday() {
  return useSyncExternalStore(subscribe, () => toIsoDate(new Date()), () => null)
}

/** The viewer's local hour (0–23), or null during SSR. */
export function useHour() {
  return useSyncExternalStore(subscribe, () => new Date().getHours(), () => null)
}
