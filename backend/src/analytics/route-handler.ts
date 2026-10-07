import { AuthError, requireSession } from "@/server/auth"
import { AnalyticsNotConfiguredError } from "./ga"

/** Runs a GA loader for an authenticated request and maps failures to JSON errors. */
export async function analyticsResponse<T>(request: Request, load: () => Promise<T>) {
  try {
    await requireSession(request)
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ message: error.message }, { status: error.status })
    throw error
  }

  try {
    return Response.json(await load())
  } catch (error) {
    if (error instanceof AnalyticsNotConfiguredError) {
      return Response.json({ message: error.message }, { status: 503 })
    }
    console.error("[analytics]", error)
    return Response.json({ message: "Failed to load Google Analytics data" }, { status: 502 })
  }
}
