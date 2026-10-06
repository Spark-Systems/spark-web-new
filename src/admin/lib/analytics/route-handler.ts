import "server-only"

import { NextResponse } from "next/server"

import { verifyRequestSession } from "@admin/lib/auth/verify-session"
import { AnalyticsNotConfiguredError } from "./ga"

/** Runs a GA loader for an authenticated request and maps failures to JSON errors. */
export async function analyticsResponse<T>(request: Request, load: () => Promise<T>) {
  if (!(await verifyRequestSession(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    return NextResponse.json(await load())
  } catch (error) {
    if (error instanceof AnalyticsNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 503 })
    }
    console.error("[analytics]", error)
    return NextResponse.json({ message: "Failed to load Google Analytics data" }, { status: 502 })
  }
}
