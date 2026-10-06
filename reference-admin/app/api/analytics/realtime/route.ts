import { getRealtime } from "@/lib/analytics/ga"
import { analyticsResponse } from "@/lib/analytics/route-handler"

export async function GET(request: Request) {
  return analyticsResponse(request, getRealtime)
}
