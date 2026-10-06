import { NextResponse, type NextRequest } from "next/server"

import { addDays, isValidRange } from "@admin/lib/analytics/date-range"
import { getOverview } from "@admin/lib/analytics/ga"
import { analyticsResponse } from "@admin/lib/analytics/route-handler"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const range = { from: params.get("from") ?? undefined, to: params.get("to") ?? undefined }

  // The viewer's "today" can be a day ahead of the server's UTC date.
  const latest = addDays(new Date().toISOString().slice(0, 10), 1)
  if (!isValidRange(range, latest)) {
    return NextResponse.json({ message: "Invalid date range" }, { status: 400 })
  }

  return analyticsResponse(request, () => getOverview(range))
}
