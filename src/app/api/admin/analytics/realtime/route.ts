import { getRealtime } from "@admin/lib/analytics/ga"
import { analyticsResponse } from "@admin/lib/analytics/route-handler"

export async function GET(request: Request) {
  return analyticsResponse(request, getRealtime)
}
