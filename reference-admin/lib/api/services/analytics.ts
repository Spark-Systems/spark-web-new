import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DateRangeValue } from "@/lib/analytics/date-range"
import type { AnalyticsOverview, RealtimeSnapshot } from "@/lib/analytics/types"
import { appApiClient } from "../client"

export const analyticsApi = {
  getOverview: (range: DateRangeValue) =>
    appApiClient.get<AnalyticsOverview>("/analytics/overview", { query: { ...range } }),
  getRealtime: () => appApiClient.get<RealtimeSnapshot>("/analytics/realtime"),
}

export const analyticsQueries = {
  overview: (range: DateRangeValue) =>
    queryOptions({
      queryKey: ["analytics", "overview", range.from, range.to],
      queryFn: () => analyticsApi.getOverview(range),
      staleTime: 5 * 60_000,
      // Changing the range keeps the previous numbers on screen until the new ones arrive.
      placeholderData: keepPreviousData,
    }),
  realtime: () =>
    queryOptions({
      queryKey: ["analytics", "realtime"],
      queryFn: analyticsApi.getRealtime,
      refetchInterval: 60_000,
    }),
}
