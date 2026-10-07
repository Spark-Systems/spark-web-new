import { addDays, isValidRange } from "@admin/lib/analytics/date-range"
import { getOverview } from "@backend/analytics/ga"
import { analyticsResponse } from "@backend/analytics/route-handler"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const range = { from: params.get("from") ?? undefined, to: params.get("to") ?? undefined }

  // The viewer's "today" can be a day ahead of the server's UTC date.
  const latest = addDays(new Date().toISOString().slice(0, 10), 1)
  if (!isValidRange(range, latest)) {
    return Response.json({ message: "Invalid date range" }, { status: 400 })
  }

  return analyticsResponse(request, () => getOverview(range))
}
