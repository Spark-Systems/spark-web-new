import { tokenStorage } from "@admin/lib/auth/token-storage"
import { API_BASE_URL } from "./config"
import { ApiError } from "./errors"
import type { AuthTokens } from "./types"

type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  query?: QueryParams
  /** Attach the access token and refresh it on 401. Defaults to true. */
  auth?: boolean
}

interface InternalOptions extends RequestOptions {
  method: string
  body?: unknown
}

interface ClientConfig {
  /** Absolute URL, or a path like "/api" for this app's own route handlers. */
  baseUrl: string
  transport: typeof fetch
}

const realFetch: typeof fetch = (...args) => fetch(...args)

/** The admin API (app/api/admin), including analytics. */
const backend: ClientConfig = { baseUrl: API_BASE_URL, transport: realFetch }

// ---- Session expiry ---------------------------------------------------------

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

/** Called when the session can't be recovered (refresh failed). Returns an unsubscribe function. */
export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

// Several requests failing together (a page's queries) send you to the login page once.
let lastSignOut = 0

/** Ends the session and tells the app to show the login page. */
function signOut() {
  tokenStorage.clear()
  if (Date.now() - lastSignOut < 3000) return
  lastSignOut = Date.now()
  unauthorizedListeners.forEach((listener) => listener())
}

// ---- Token refresh ----------------------------------------------------------

let refreshPromise: Promise<boolean> | null = null

/**
 * Exchanges the refresh token for a new token pair. Concurrent callers share a
 * single in-flight request, so a burst of 401s triggers only one refresh.
 */
export function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return false
    try {
      const tokens = await request<AuthTokens>(backend, "/auth/refresh", {
        method: "POST",
        body: { refresh_token: refreshToken },
        auth: false,
      })
      tokenStorage.setTokens(tokens)
      return true
    } catch {
      return false
    }
  })().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

// ---- Request ----------------------------------------------------------------

function buildUrl(baseUrl: string, path: string, query?: QueryParams) {
  const url = new URL(baseUrl.replace(/\/$/, "") + path, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value != null) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
    return data.message
  }
  return fallback
}

/**
 * Sends a request with the session token. On a 401 it refreshes the session
 * once and retries; if that can't fix it, the session ends and the app goes
 * back to the login page. Every admin call goes through here.
 */
async function send(config: ClientConfig, path: string, options: InternalOptions, isRetry = false): Promise<Response> {
  const { body, query, auth = true, headers, ...init } = options

  const finalHeaders = new Headers(headers)
  finalHeaders.set("Accept", "application/json")

  let finalBody: BodyInit | undefined
  if (body instanceof FormData) {
    finalBody = body
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json")
    finalBody = JSON.stringify(body)
  }

  if (auth) {
    const token = tokenStorage.getAccessToken()
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`)
  }

  const res = await config.transport(buildUrl(config.baseUrl, path, query), {
    ...init,
    headers: finalHeaders,
    body: finalBody,
  })

  if (res.status === 401 && auth) {
    if (!isRetry && (await refreshSession())) return send(config, path, options, true)
    signOut()
  }
  return res
}

async function request<T>(config: ClientConfig, path: string, options: InternalOptions): Promise<T> {
  const res = await send(config, path, options)
  const data = await parseBody(res)
  if (!res.ok) {
    throw new ApiError(res.status, errorMessage(data, res.statusText || "Request failed"), data)
  }
  return data as T
}

function createClient(config: ClientConfig) {
  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>(config, path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(config, path, { ...options, body, method: "POST" }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(config, path, { ...options, body, method: "PUT" }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(config, path, { ...options, body, method: "PATCH" }),
    delete: <T>(path: string, options?: RequestOptions) =>
      request<T>(config, path, { ...options, method: "DELETE" }),
    /** A file (e.g. a CV), with the same session handling as every other call. */
    download: async (path: string, options?: RequestOptions): Promise<Blob> => {
      const res = await send(config, path, { ...options, method: "GET" })
      if (!res.ok) {
        const data = await parseBody(res)
        throw new ApiError(res.status, errorMessage(data, res.statusText || "Download failed"), data)
      }
      return res.blob()
    },
  }
}

/** Calls the admin API. */
export const apiClient = createClient(backend)

/** Same client; kept as a separate name for the analytics endpoints. */
export const appApiClient = apiClient
