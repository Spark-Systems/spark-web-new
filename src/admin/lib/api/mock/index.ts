import { API_BASE_URL } from "../config"
import type {
  AdvancedSettings,
  AdvancedSettingsUpdate,
  AuthTokens,
  LoginPayload,
  LogoItem,
  LogoItemInput,
  MetaSettings,
  SiteService,
  SiteServiceInput,
  SocialLinks,
  Solution,
  SolutionInput,
} from "../types"
import { defaultAdvancedSettings, defaultMetaSettings, defaultSocialLinks, MOCK_CREDENTIALS, mockAdmin } from "./data"
import { seedClients, seedPartners, seedServices, seedSolutions } from "./seeds"

// A fetch-compatible fake backend. The API client calls it exactly like the
// real network, so auth headers, 401 handling and token refresh all run for real.

/** Lower these (e.g. ACCESS_TOKEN_TTL = 20) to watch the refresh flow kick in. */
const ACCESS_TOKEN_TTL = 15 * 60
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60

type TokenType = "access" | "refresh"

interface TokenPayload {
  sub: string
  type: TokenType
  exp: number
}

const base64url = (value: string) => btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

function signToken(type: TokenType, ttl: number) {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }))
  const payload: TokenPayload = { sub: mockAdmin.id, type, exp: Math.floor(Date.now() / 1000) + ttl }
  return `${header}.${base64url(JSON.stringify(payload))}.mock`
}

export function verifyToken(token: string | null | undefined, type: TokenType) {
  try {
    const encoded = token?.split(".")[1]
    if (!encoded) return false
    const payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))) as TokenPayload
    return payload.type === type && payload.exp > Date.now() / 1000
  } catch {
    return false
  }
}

function issueTokens(): AuthTokens {
  return {
    access_token: signToken("access", ACCESS_TOKEN_TTL),
    refresh_token: signToken("refresh", REFRESH_TOKEN_TTL),
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL,
    refresh_expires_in: REFRESH_TOKEN_TTL,
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } })

const unauthorized = () => json({ message: "Unauthorized" }, 401)
const notFound = () => json({ message: "Not found" }, 404)
const noContent = () => new Response(null, { status: 204 })

// Saved data survives reloads in this browser, so the demo feels real.
const STORE_PREFIX = "spark-admin-mock:"

function readStore<T extends object>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORE_PREFIX + key)
    if (saved) return { ...fallback, ...JSON.parse(saved) }
  } catch {
    // Storage unavailable (private mode, SSR); fall back to defaults.
  }
  return fallback
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Ignore; the response still reflects the update.
  }
}

function readList<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(STORE_PREFIX + key)
    if (saved) return JSON.parse(saved) as T[]
  } catch {
    // Fall back to the seed data.
  }
  return fallback
}

const sameText = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

/** Uploaded files become data URLs, so they survive reloads like the settings do. */
const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** Secrets are write-only: report whether they're set, never their value. */
const publicAdvanced = (stored: AdvancedSettingsUpdate): AdvancedSettings => ({
  ...stored,
  smtp_password: "",
  smtp_password_set: stored.smtp_password !== "",
  recaptcha_secret_key: "",
  recaptcha_secret_set: stored.recaptcha_secret_key !== "",
})

interface MockRequest {
  /** Parsed JSON, or the FormData for multipart requests. */
  body: unknown
  /** Values of :param segments in the route, e.g. { id: "svc_design" }. */
  params: Record<string, string>
  headers: Headers
  searchParams: URLSearchParams
}

type Handler = (req: MockRequest) => Response | Promise<Response>

const isAuthorized = (req: MockRequest) =>
  verifyToken(req.headers.get("Authorization")?.replace(/^Bearer /, ""), "access")

/** Sorts by a field: numbers numerically, text in the field's language. */
function compareBy<T>(sort: keyof T, desc: boolean) {
  return (a: T, b: T) => {
    const av = a[sort]
    const bv = b[sort]
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), String(sort).endsWith("_ar") ? "ar" : "en")
    return desc ? -cmp : cmp
  }
}

interface ListRecord {
  id: string
  name_en: string
  name_ar: string
  order: number
  hidden: boolean
  created_at: string
}

interface ListResource<T extends ListRecord, I> {
  base: string
  storeKey: string
  seed: T[]
  idPrefix: string
  /** Error response when the input can't be saved, or null when it's valid. */
  validate: (input: I, all: T[], selfId?: string) => Response | null
  /** Facet filters beyond status, by query key: does the row match one of these values? */
  facets?: Record<string, (row: T, value: string) => boolean>
}

/**
 * Server-style list routes for a resource: search, facet filters, sort and
 * pagination on GET, plus get / create / update / delete by id.
 */
function listRoutes<T extends ListRecord, I extends object>({
  base,
  storeKey,
  seed,
  idPrefix,
  validate,
  facets = {},
}: ListResource<T, I>): Record<string, Handler> {
  return {
    [`GET ${base}`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
      const sort = (req.searchParams.get("sort") ?? "order") as keyof T
      const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
      const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
      // Facet filter: status=visible,hidden (absent means both), plus resource-specific ones.
      const statuses = req.searchParams.get("status")?.split(",") ?? []
      const rows = readList(storeKey, seed)
        .filter((r) => !q || r.name_en.toLocaleLowerCase().includes(q) || r.name_ar.includes(q))
        .filter((r) => statuses.length === 0 || statuses.includes(r.hidden ? "hidden" : "visible"))
        .filter((r) =>
          Object.entries(facets).every(([key, matches]) => {
            const values = req.searchParams.get(key)?.split(",") ?? []
            return values.length === 0 || values.some((value) => matches(r, value))
          }),
        )
        .sort(compareBy<T>(sort, req.searchParams.get("order") === "desc"))
      return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
    },
    [`GET ${base}/:id`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const row = readList(storeKey, seed).find((r) => r.id === req.params.id)
      return row ? json(row) : notFound()
    },
    [`POST ${base}`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const input = req.body as I
      const all = readList(storeKey, seed)
      const error = validate(input, all)
      if (error) return error
      const row = { ...input, id: `${idPrefix}_${Date.now().toString(36)}`, created_at: new Date().toISOString() } as unknown as T
      writeStore(storeKey, [...all, row])
      return json(row, 201)
    },
    [`PUT ${base}/:id`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const input = req.body as I
      const all = readList(storeKey, seed)
      const current = all.find((r) => r.id === req.params.id)
      if (!current) return notFound()
      const error = validate(input, all, current.id)
      if (error) return error
      const updated = { ...current, ...input }
      writeStore(storeKey, all.map((r) => (r.id === current.id ? updated : r)))
      return json(updated)
    },
    [`DELETE ${base}/:id`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const all = readList(storeKey, seed)
      if (!all.some((r) => r.id === req.params.id)) return notFound()
      writeStore(storeKey, all.filter((r) => r.id !== req.params.id))
      return noContent()
    },
  }
}

/** Slugs must be unique within a resource (they're the page URLs). */
const slugTaken = <T extends { id: string; slug: string }>(slug: string, all: T[], selfId?: string) =>
  all.some((r) => r.id !== selfId && sameText(r.slug, slug))

const logoItemResource = (base: string, storeKey: string, seed: LogoItem[], idPrefix: string) =>
  listRoutes<LogoItem, LogoItemInput>({
    base,
    storeKey,
    seed,
    idPrefix,
    validate: (input) => (!input.logo_url ? json({ message: "A logo is required" }, 422) : null),
  })

const routes: Record<string, Handler> = {
  "POST /auth/login": ({ body }) => {
    const { email, password } = (body ?? {}) as Partial<LoginPayload>
    if (
      !MOCK_CREDENTIALS.password ||
      email?.toLowerCase() !== MOCK_CREDENTIALS.email ||
      password !== MOCK_CREDENTIALS.password
    ) {
      return json({ message: "Invalid email or password" }, 401)
    }
    return json(issueTokens())
  },

  "POST /auth/refresh": ({ body }) => {
    const { refresh_token } = (body ?? {}) as { refresh_token?: string }
    return verifyToken(refresh_token, "refresh") ? json(issueTokens()) : unauthorized()
  },

  "POST /auth/logout": () => noContent(),

  "GET /auth/me": (req) => (isAuthorized(req) ? json(mockAdmin) : unauthorized()),

  "GET /settings/meta": (req) =>
    isAuthorized(req) ? json(readStore("settings-meta", defaultMetaSettings)) : unauthorized(),

  "PUT /settings/meta": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const body = (req.body ?? {}) as Partial<MetaSettings>
    if (!body.name_en?.trim() || !body.name_ar?.trim()) return json({ message: "Both names are required" }, 422)
    const meta = { ...readStore("settings-meta", defaultMetaSettings), ...body }
    writeStore("settings-meta", meta)
    return json(meta)
  },

  "GET /settings/social": (req) =>
    isAuthorized(req) ? json(readStore("settings-social", defaultSocialLinks)) : unauthorized(),

  "PUT /settings/social": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const links = { ...readStore("settings-social", defaultSocialLinks), ...(req.body as Partial<SocialLinks>) }
    writeStore("settings-social", links)
    return json(links)
  },

  "GET /settings/advanced": (req) =>
    isAuthorized(req) ? json(publicAdvanced(readStore("settings-advanced", defaultAdvancedSettings))) : unauthorized(),

  "PUT /settings/advanced": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const current = readStore("settings-advanced", defaultAdvancedSettings)
    const body = req.body as Partial<AdvancedSettingsUpdate>
    const next: AdvancedSettingsUpdate = {
      ...current,
      ...body,
      // An empty secret means "keep the stored one".
      smtp_password: body.smtp_password || current.smtp_password,
      recaptcha_secret_key: body.recaptcha_secret_key || current.recaptcha_secret_key,
    }
    writeStore("settings-advanced", next)
    return json(publicAdvanced(next))
  },

  ...listRoutes<SiteService, SiteServiceInput>({
    base: "/services",
    storeKey: "services",
    seed: seedServices,
    idPrefix: "svc",
    validate: (input, all, selfId) => {
      if (!input.image_url) return json({ message: "A picture is required" }, 422)
      if (slugTaken(input.slug, all, selfId)) return json({ message: "Another service uses this URL", code: "slug_taken" }, 409)
      return null
    },
    // detail=yes,no: whether the service has its own page.
    facets: { detail: (row, value) => (row.has_detail ? "yes" : "no") === value },
  }),

  ...listRoutes<Solution, SolutionInput>({
    base: "/solutions",
    storeKey: "solutions",
    seed: seedSolutions,
    idPrefix: "sol",
    validate: (input, all, selfId) => {
      if (!input.image_url) return json({ message: "A picture is required" }, 422)
      if (slugTaken(input.slug, all, selfId)) return json({ message: "Another solution uses this URL", code: "slug_taken" }, 409)
      return null
    },
    // flagship=yes,no and detail=yes,no.
    facets: {
      flagship: (row, value) => (row.flagship ? "yes" : "no") === value,
      detail: (row, value) => (row.has_detail ? "yes" : "no") === value,
    },
  }),

  ...logoItemResource("/clients", "clients", seedClients, "cli"),
  ...logoItemResource("/partners", "partners", seedPartners, "par"),

  "POST /uploads": async (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const file = req.body instanceof FormData ? req.body.get("file") : null
    if (!(file instanceof File)) return json({ message: "No file provided" }, 422)
    if (file.size > MAX_UPLOAD_BYTES) return json({ message: "File is too large" }, 413)
    return json({ url: await toDataUrl(file) })
  },
}

// Routes may contain :param segments, e.g. "GET /services/:id".
const compiled = Object.entries(routes).map(([key, handler]) => {
  const [method, pattern] = key.split(" ")
  const names: string[] = []
  const regex = new RegExp(
    `^${pattern.replace(/:(\w+)/g, (_, name: string) => {
      names.push(name)
      return "([^/]+)"
    })}$`,
  )
  return { method, regex, names, handler }
})

function matchRoute(method: string, path: string) {
  for (const route of compiled) {
    if (route.method !== method) continue
    const found = route.regex.exec(path)
    if (found) {
      const params = Object.fromEntries(route.names.map((name, i) => [name, decodeURIComponent(found[i + 1])]))
      return { handler: route.handler, params }
    }
  }
  return null
}

const basePath = new URL(API_BASE_URL).pathname.replace(/\/$/, "")
const delay = () => new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))

export const mockFetch: typeof fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input.toString())
  const method = (init?.method ?? "GET").toUpperCase()
  const path = url.pathname.slice(basePath.length) || "/"

  await delay()

  const match = matchRoute(method, path)
  if (!match) return json({ message: `Mock route not found: ${method} ${path}` }, 404)

  const body =
    init?.body instanceof FormData ? init.body : typeof init?.body === "string" ? JSON.parse(init.body) : undefined
  return match.handler({
    params: match.params,
    body,
    headers: new Headers(init?.headers),
    searchParams: url.searchParams,
  })
}
