import { getRealtime } from "@backend/analytics/ga"
import { analyticsResponse } from "@backend/analytics/route-handler"

export async function GET(request: Request) {
  return analyticsResponse(request, getRealtime)
}
