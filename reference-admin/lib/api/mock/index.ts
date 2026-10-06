import { API_BASE_URL } from "../config"
import type {
  LogoItem,
  LogoItemInput,
  Service,
  ServiceInput,
  FooterContact,
  HomeBanner,
  HomeBannerInput,
  WelcomeMessage,
  Product,
  ProductInput,
  ProductCategory,
  ProductCategoryInput,
  AboutSection,
  AboutSectionInput,
  AdvancedSettings,
  AdvancedSettingsUpdate,
  AuthTokens,
  BannerInput,
  Country,
  InternalBanner,
  CountryInput,
  LoginPayload,
  MetaSettings,
  SocialLinks,
} from "../types"
import { seedAboutSections } from "./about"
import { seedClients, seedPartners, seedServices } from "./services-and-logos"
import { defaultFooterContact, defaultWelcomeMessage, seedHomeBanners } from "./home"
import { seedProductCategories, type StoredCategory } from "./product-categories"
import { seedProducts, type StoredProduct } from "./products"
import { seedBanners, seedCountries } from "./countries"
import { defaultAdvancedSettings, defaultMetaSettings, defaultSocialLinks, MOCK_CREDENTIALS, mockAdmin } from "./data"

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

const base64url = (value: string) =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

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

// Saved settings survive reloads in this browser, so the demo feels real.
function readStore<T extends object>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`spark-mock:${key}`)
    if (saved) return { ...fallback, ...JSON.parse(saved) }
  } catch {
    // Storage unavailable (private mode, SSR); fall back to defaults.
  }
  return fallback
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(`spark-mock:${key}`, JSON.stringify(value))
  } catch {
    // Ignore; the response still reflects the update.
  }
}

function readList<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(`spark-mock:${key}`)
    if (saved) return JSON.parse(saved) as T[]
  } catch {
    // Fall back to the seed data.
  }
  return fallback
}

const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

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
  /** Values of :param segments in the route, e.g. { id: "cty_001" }. */
  params: Record<string, string>
  headers: Headers
  searchParams: URLSearchParams
}

type Handler = (req: MockRequest) => Response | Promise<Response>

const isAuthorized = (req: MockRequest) =>
  verifyToken(req.headers.get("Authorization")?.replace(/^Bearer /, ""), "access")

/** Adds the parent's names and the subcategory count that responses carry. */
function withRelations(category: StoredCategory, all: StoredCategory[]): ProductCategory {
  const parent = category.parent_id ? all.find((c) => c.id === category.parent_id) : undefined
  return {
    ...category,
    parent: parent ? { id: parent.id, name_en: parent.name_en, name_ar: parent.name_ar } : null,
    children_count: all.filter((c) => c.parent_id === category.id).length,
  }
}

/** Checks the two-level rule and name clashes; returns an error response, or null when valid. */
function checkCategory(input: ProductCategoryInput, all: StoredCategory[], selfId?: string) {
  if (!input.image_url) return json({ message: "A picture is required" }, 422)
  if (input.parent_id) {
    const parent = all.find((c) => c.id === input.parent_id)
    if (!parent || parent.id === selfId) return json({ message: "Parent category not found" }, 422)
    if (parent.parent_id) return json({ message: "A subcategory can't have subcategories" }, 422)
    if (selfId && all.some((c) => c.parent_id === selfId)) {
      return json({ message: "A category with subcategories must stay a main category" }, 422)
    }
  }
  const clash = all.some(
    (c) =>
      c.id !== selfId &&
      c.parent_id === (input.parent_id ?? null) &&
      (sameName(c.name_en, input.name_en) || sameName(c.name_ar, input.name_ar))
  )
  return clash ? json({ message: "A category with this name already exists here" }, 409) : null
}

/** Adds the category (and its main category) that product responses carry. */
function withCategory(product: StoredProduct, categories: StoredCategory[]): Product {
  const category = categories.find((c) => c.id === product.category_id)
  const parent = category?.parent_id ? categories.find((c) => c.id === category.parent_id) : undefined
  const ref = (c: StoredCategory) => ({ id: c.id, name_en: c.name_en, name_ar: c.name_ar })
  return { ...product, category: category ? { ...ref(category), parent: parent ? ref(parent) : null } : null }
}

function checkProduct(input: ProductInput, categories: StoredCategory[]) {
  if (!input.image_url) return json({ message: "A main picture is required" }, 422)
  if (!categories.some((c) => c.id === input.category_id)) return json({ message: "Category not found" }, 422)
  return null
}

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

/** CRUD routes for a list of logo companies (clients, partners). */
function logoItemRoutes(base: string, storeKey: string, seed: LogoItem[], idPrefix: string): Record<string, Handler> {
  const invalid = (input: LogoItemInput) => (!input.logo_url ? json({ message: "A logo is required" }, 422) : null)
  return {
    [`GET ${base}`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
      const sort = (req.searchParams.get("sort") ?? "order") as keyof LogoItem
      const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
      const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
      const statuses = req.searchParams.get("status")?.split(",") ?? []
      const rows = readList(storeKey, seed)
        .filter((c) => !q || c.name_en.toLocaleLowerCase().includes(q) || c.name_ar.includes(q))
        .filter((c) => statuses.length === 0 || statuses.includes(c.hidden ? "hidden" : "visible"))
        .sort(compareBy<LogoItem>(sort, req.searchParams.get("order") === "desc"))
      return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
    },
    [`GET ${base}/:id`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const item = readList(storeKey, seed).find((c) => c.id === req.params.id)
      return item ? json(item) : json({ message: "Not found" }, 404)
    },
    [`POST ${base}`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const input = req.body as LogoItemInput
      const error = invalid(input)
      if (error) return error
      const item: LogoItem = { ...input, id: `${idPrefix}_${Date.now().toString(36)}`, created_at: new Date().toISOString() }
      writeStore(storeKey, [...readList(storeKey, seed), item])
      return json(item, 201)
    },
    [`PUT ${base}/:id`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const input = req.body as LogoItemInput
      const list = readList(storeKey, seed)
      const current = list.find((c) => c.id === req.params.id)
      if (!current) return json({ message: "Not found" }, 404)
      const error = invalid(input)
      if (error) return error
      const updated = { ...current, ...input }
      writeStore(storeKey, list.map((c) => (c.id === current.id ? updated : c)))
      return json(updated)
    },
    [`DELETE ${base}/:id`]: (req) => {
      if (!isAuthorized(req)) return unauthorized()
      const list = readList(storeKey, seed)
      if (!list.some((c) => c.id === req.params.id)) return json({ message: "Not found" }, 404)
      writeStore(storeKey, list.filter((c) => c.id !== req.params.id))
      return new Response(null, { status: 204 })
    },
  }
}

const routes: Record<string, Handler> = {
  ...logoItemRoutes("/clients", "clients", seedClients, "cli"),
  ...logoItemRoutes("/partners", "partners", seedPartners, "par"),

  "POST /auth/login": ({ body }) => {
    const { email, password } = (body ?? {}) as Partial<LoginPayload>
    if (!MOCK_CREDENTIALS.password || email?.toLowerCase() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
      return json({ message: "Invalid email or password" }, 401)
    }
    return json(issueTokens())
  },

  "POST /auth/refresh": ({ body }) => {
    const { refresh_token } = (body ?? {}) as { refresh_token?: string }
    return verifyToken(refresh_token, "refresh") ? json(issueTokens()) : unauthorized()
  },

  "POST /auth/logout": () => new Response(null, { status: 204 }),

  "GET /auth/me": (req) => (isAuthorized(req) ? json(mockAdmin) : unauthorized()),

  "GET /settings/meta": (req) =>
    isAuthorized(req) ? json(readStore("settings-meta", defaultMetaSettings)) : unauthorized(),

  "PUT /settings/meta": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const body = (req.body ?? {}) as Partial<MetaSettings>
    if (!body.name_en?.trim() || !body.name_ar?.trim()) {
      return json({ message: "Both names are required" }, 422)
    }
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

  // Server-side list: search, sort and paginate like a real backend would.
  "GET /countries": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sort = (req.searchParams.get("sort") ?? "order") as keyof Country
    const desc = req.searchParams.get("order") === "desc"
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)

    // Facet filter: status=visible,hidden (absent means both).
    const statuses = req.searchParams.get("status")?.split(",") ?? []
    const rows = readList("countries", seedCountries)
      .filter((c) => !q || c.name_en.toLocaleLowerCase().includes(q) || c.name_ar.includes(q))
      .filter((c) => statuses.length === 0 || statuses.includes(c.hidden ? "hidden" : "visible"))
      .sort((a, b) => {
        const av = a[sort]
        const bv = b[sort]
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), sort === "name_ar" ? "ar" : "en")
        return desc ? -cmp : cmp
      })
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /countries/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const country = readList("countries", seedCountries).find((c) => c.id === req.params.id)
    return country ? json(country) : json({ message: "Not found" }, 404)
  },

  "POST /countries": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as CountryInput
    const list = readList("countries", seedCountries)
    if (list.some((c) => sameName(c.name_en, input.name_en) || sameName(c.name_ar, input.name_ar))) {
      return json({ message: "A country with this name already exists" }, 409)
    }
    const country: Country = { ...input, id: `cty_${Date.now().toString(36)}`, created_at: new Date().toISOString() }
    writeStore("countries", [...list, country])
    return json(country, 201)
  },

  "PUT /countries/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as CountryInput
    const list = readList("countries", seedCountries)
    const current = list.find((c) => c.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    const clash = list.some(
      (c) => c.id !== current.id && (sameName(c.name_en, input.name_en) || sameName(c.name_ar, input.name_ar))
    )
    if (clash) return json({ message: "A country with this name already exists" }, 409)
    const updated = { ...current, ...input }
    writeStore("countries", list.map((c) => (c.id === current.id ? updated : c)))
    return json(updated)
  },

  "DELETE /countries/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const list = readList("countries", seedCountries)
    if (!list.some((c) => c.id === req.params.id)) return json({ message: "Not found" }, 404)
    writeStore("countries", list.filter((c) => c.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  // Bulk create from an imported sheet; existing names are skipped, not duplicated.
  "POST /countries/import": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const { rows = [] } = (req.body ?? {}) as { rows?: Pick<CountryInput, "name_en" | "name_ar">[] }
    const list = readList("countries", seedCountries)
    let maxOrder = Math.max(0, ...list.map((c) => c.order))
    let skipped = 0
    const created: Country[] = []
    for (const row of rows) {
      const taken = [...list, ...created].some((c) => sameName(c.name_en, row.name_en) || sameName(c.name_ar, row.name_ar))
      if (taken) {
        skipped++
        continue
      }
      maxOrder += 10
      created.push({
        id: `cty_${Date.now().toString(36)}_${created.length}`,
        name_en: row.name_en.trim(),
        name_ar: row.name_ar.trim(),
        order: maxOrder,
        hidden: false,
        created_at: new Date().toISOString(),
      })
    }
    writeStore("countries", [...list, ...created])
    return json({ created: created.length, skipped })
  },

  "GET /internal-banners": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sections = req.searchParams.get("section")?.split(",") ?? []
    const sort = (req.searchParams.get("sort") ?? "created_at") as keyof InternalBanner
    const desc = req.searchParams.get("order") === "desc"
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
    const rows = readList("internal-banners", seedBanners)
      .filter((b) => !q || b.name_en.toLocaleLowerCase().includes(q) || b.name_ar.includes(q))
      .filter((b) => sections.length === 0 || sections.includes(b.section))
      .sort((a, b) => {
        const cmp = String(a[sort]).localeCompare(String(b[sort]), sort === "name_ar" ? "ar" : "en")
        return desc ? -cmp : cmp
      })
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /internal-banners/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const banner = readList("internal-banners", seedBanners).find((b) => b.id === req.params.id)
    return banner ? json(banner) : json({ message: "Not found" }, 404)
  },

  "POST /internal-banners": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as BannerInput
    if (!input.no_image && !input.image_url) return json({ message: "A picture is required" }, 422)
    const banner: InternalBanner = {
      ...input,
      image_url: input.no_image ? null : input.image_url,
      id: `bnr_${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    writeStore("internal-banners", [...readList("internal-banners", seedBanners), banner])
    return json(banner, 201)
  },

  "PUT /internal-banners/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as BannerInput
    const list = readList("internal-banners", seedBanners)
    const current = list.find((b) => b.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    if (!input.no_image && !input.image_url) return json({ message: "A picture is required" }, 422)
    const updated = { ...current, ...input, image_url: input.no_image ? null : input.image_url }
    writeStore("internal-banners", list.map((b) => (b.id === current.id ? updated : b)))
    return json(updated)
  },

  "DELETE /internal-banners/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const list = readList("internal-banners", seedBanners)
    if (!list.some((b) => b.id === req.params.id)) return json({ message: "Not found" }, 404)
    writeStore("internal-banners", list.filter((b) => b.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  "GET /about-us": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sort = (req.searchParams.get("sort") ?? "order") as keyof AboutSection
    const desc = req.searchParams.get("order") === "desc"
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
    const statuses = req.searchParams.get("status")?.split(",") ?? []
    const rows = readList("about-us", seedAboutSections)
      .filter((a) => !q || a.name_en.toLocaleLowerCase().includes(q) || a.name_ar.includes(q))
      .filter((a) => statuses.length === 0 || statuses.includes(a.hidden ? "hidden" : "visible"))
      .sort((a, b) => {
        const av = a[sort]
        const bv = b[sort]
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), sort === "name_ar" ? "ar" : "en")
        return desc ? -cmp : cmp
      })
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /about-us/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const section = readList("about-us", seedAboutSections).find((a) => a.id === req.params.id)
    return section ? json(section) : json({ message: "Not found" }, 404)
  },

  "POST /about-us": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as AboutSectionInput
    if (!input.image_url) return json({ message: "A picture is required" }, 422)
    const section: AboutSection = { ...input, id: `abt_${Date.now().toString(36)}`, created_at: new Date().toISOString() }
    writeStore("about-us", [...readList("about-us", seedAboutSections), section])
    return json(section, 201)
  },

  "PUT /about-us/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as AboutSectionInput
    const list = readList("about-us", seedAboutSections)
    const current = list.find((a) => a.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    if (!input.image_url) return json({ message: "A picture is required" }, 422)
    const updated = { ...current, ...input }
    writeStore("about-us", list.map((a) => (a.id === current.id ? updated : a)))
    return json(updated)
  },

  "DELETE /about-us/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const list = readList("about-us", seedAboutSections)
    if (!list.some((a) => a.id === req.params.id)) return json({ message: "Not found" }, 404)
    writeStore("about-us", list.filter((a) => a.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  "GET /product-categories": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sort = req.searchParams.get("sort") ?? "order"
    const desc = req.searchParams.get("order") === "desc"
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
    const statuses = req.searchParams.get("status")?.split(",") ?? []
    const levels = req.searchParams.get("level")?.split(",") ?? []
    const all = readList("product-categories", seedProductCategories)
    const rows = all
      .map((c) => withRelations(c, all))
      .filter((c) => !q || c.name_en.toLocaleLowerCase().includes(q) || c.name_ar.includes(q))
      .filter((c) => statuses.length === 0 || statuses.includes(c.hidden ? "hidden" : "visible"))
      .filter((c) => levels.length === 0 || levels.includes(c.parent_id ? "sub" : "main"))
      .sort((a, b) => {
        // "parent" sorts by the parent's English name; main categories come first.
        const av = sort === "parent" ? (a.parent?.name_en ?? "") : a[sort as keyof ProductCategory]
        const bv = sort === "parent" ? (b.parent?.name_en ?? "") : b[sort as keyof ProductCategory]
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), sort === "name_ar" ? "ar" : "en")
        return desc ? -cmp : cmp
      })
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /product-categories/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const all = readList("product-categories", seedProductCategories)
    const category = all.find((c) => c.id === req.params.id)
    return category ? json(withRelations(category, all)) : json({ message: "Not found" }, 404)
  },

  "POST /product-categories": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as ProductCategoryInput
    const all = readList("product-categories", seedProductCategories)
    const invalid = checkCategory(input, all)
    if (invalid) return invalid
    const category: StoredCategory = {
      ...input,
      parent_id: input.parent_id || null,
      id: `cat_${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    const next = [...all, category]
    writeStore("product-categories", next)
    return json(withRelations(category, next), 201)
  },

  "PUT /product-categories/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as ProductCategoryInput
    const all = readList("product-categories", seedProductCategories)
    const current = all.find((c) => c.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    const invalid = checkCategory(input, all, current.id)
    if (invalid) return invalid
    const updated: StoredCategory = { ...current, ...input, parent_id: input.parent_id || null }
    const next = all.map((c) => (c.id === current.id ? updated : c))
    writeStore("product-categories", next)
    return json(withRelations(updated, next))
  },

  "DELETE /product-categories/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const all = readList("product-categories", seedProductCategories)
    if (!all.some((c) => c.id === req.params.id)) return json({ message: "Not found" }, 404)
    if (all.some((c) => c.parent_id === req.params.id)) {
      return json({ message: "Delete or move its subcategories first", code: "has_subcategories" }, 409)
    }
    if (readList("products", seedProducts).some((p) => p.category_id === req.params.id)) {
      return json({ message: "Move or delete its products first", code: "has_products" }, 409)
    }
    writeStore("product-categories", all.filter((c) => c.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  "GET /products": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sort = req.searchParams.get("sort") ?? "order"
    const desc = req.searchParams.get("order") === "desc"
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
    const statuses = req.searchParams.get("status")?.split(",") ?? []
    // category=<main id>: products in that category or any of its subcategories.
    const categoryIds = req.searchParams.get("category")?.split(",") ?? []
    const categories = readList("product-categories", seedProductCategories)
    const rows = readList("products", seedProducts)
      .map((p) => withCategory(p, categories))
      .filter((p) => !q || p.name_en.toLocaleLowerCase().includes(q) || p.name_ar.includes(q))
      .filter((p) => statuses.length === 0 || statuses.includes(p.hidden ? "hidden" : "visible"))
      .filter(
        (p) =>
          categoryIds.length === 0 ||
          categoryIds.includes(p.category_id) ||
          (p.category?.parent != null && categoryIds.includes(p.category.parent.id))
      )
      .sort((a, b) => {
        const av = sort === "category" ? (a.category?.name_en ?? "") : a[sort as keyof Product]
        const bv = sort === "category" ? (b.category?.name_en ?? "") : b[sort as keyof Product]
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), sort === "name_ar" ? "ar" : "en")
        return desc ? -cmp : cmp
      })
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /products/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const product = readList("products", seedProducts).find((p) => p.id === req.params.id)
    return product
      ? json(withCategory(product, readList("product-categories", seedProductCategories)))
      : json({ message: "Not found" }, 404)
  },

  "POST /products": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as ProductInput
    const categories = readList("product-categories", seedProductCategories)
    const invalid = checkProduct(input, categories)
    if (invalid) return invalid
    const product: StoredProduct = { ...input, id: `prd_${Date.now().toString(36)}`, created_at: new Date().toISOString() }
    writeStore("products", [...readList("products", seedProducts), product])
    return json(withCategory(product, categories), 201)
  },

  "PUT /products/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as ProductInput
    const categories = readList("product-categories", seedProductCategories)
    const list = readList("products", seedProducts)
    const current = list.find((p) => p.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    const invalid = checkProduct(input, categories)
    if (invalid) return invalid
    const updated = { ...current, ...input }
    writeStore("products", list.map((p) => (p.id === current.id ? updated : p)))
    return json(withCategory(updated, categories))
  },

  "DELETE /products/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const list = readList("products", seedProducts)
    if (!list.some((p) => p.id === req.params.id)) return json({ message: "Not found" }, 404)
    writeStore("products", list.filter((p) => p.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  "GET /home/banners": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sort = (req.searchParams.get("sort") ?? "order") as keyof HomeBanner
    const desc = req.searchParams.get("order") === "desc"
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
    const statuses = req.searchParams.get("status")?.split(",") ?? []
    const rows = readList("home-banners", seedHomeBanners)
      .filter(
        (b) =>
          !q ||
          [b.headline1_en, b.headline2_en, b.headline3_en].some((h) => h.toLocaleLowerCase().includes(q)) ||
          [b.headline1_ar, b.headline2_ar, b.headline3_ar].some((h) => h.includes(q))
      )
      .filter((b) => statuses.length === 0 || statuses.includes(b.hidden ? "hidden" : "visible"))
      .sort((a, b) => {
        const av = a[sort]
        const bv = b[sort]
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), sort.endsWith("_ar") ? "ar" : "en")
        return desc ? -cmp : cmp
      })
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /home/banners/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const banner = readList("home-banners", seedHomeBanners).find((b) => b.id === req.params.id)
    return banner ? json(banner) : json({ message: "Not found" }, 404)
  },

  "POST /home/banners": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as HomeBannerInput
    if (!input.image_en_url || !input.image_ar_url) return json({ message: "Both pictures are required" }, 422)
    const banner: HomeBanner = { ...input, id: `hb_${Date.now().toString(36)}`, created_at: new Date().toISOString() }
    writeStore("home-banners", [...readList("home-banners", seedHomeBanners), banner])
    return json(banner, 201)
  },

  "PUT /home/banners/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as HomeBannerInput
    const list = readList("home-banners", seedHomeBanners)
    const current = list.find((b) => b.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    if (!input.image_en_url || !input.image_ar_url) return json({ message: "Both pictures are required" }, 422)
    const updated = { ...current, ...input }
    writeStore("home-banners", list.map((b) => (b.id === current.id ? updated : b)))
    return json(updated)
  },

  "DELETE /home/banners/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const list = readList("home-banners", seedHomeBanners)
    if (!list.some((b) => b.id === req.params.id)) return json({ message: "Not found" }, 404)
    writeStore("home-banners", list.filter((b) => b.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  "GET /home/welcome-message": (req) =>
    isAuthorized(req) ? json(readStore("home-welcome", defaultWelcomeMessage)) : unauthorized(),

  "PUT /home/welcome-message": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const body = (req.body ?? {}) as Partial<WelcomeMessage>
    if (!body.name_en?.trim() || !body.name_ar?.trim()) return json({ message: "Both names are required" }, 422)
    const welcome = { ...readStore("home-welcome", defaultWelcomeMessage), ...body }
    writeStore("home-welcome", welcome)
    return json(welcome)
  },

  "GET /home/footer-contact": (req) =>
    isAuthorized(req) ? json(readStore("home-footer", defaultFooterContact)) : unauthorized(),

  "PUT /home/footer-contact": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const body = (req.body ?? {}) as Partial<FooterContact>
    if (!body.name_en?.trim() || !body.name_ar?.trim()) return json({ message: "Both names are required" }, 422)
    const footer = { ...readStore("home-footer", defaultFooterContact), ...body }
    writeStore("home-footer", footer)
    return json(footer)
  },

  "GET /services": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const q = req.searchParams.get("q")?.trim().toLocaleLowerCase() ?? ""
    const sort = (req.searchParams.get("sort") ?? "order") as keyof Service
    const page = Math.max(Number(req.searchParams.get("page")) || 1, 1)
    const size = Math.min(Math.max(Number(req.searchParams.get("page_size")) || 10, 1), 100)
    const statuses = req.searchParams.get("status")?.split(",") ?? []
    // home=yes,no: whether the service is shown on the home page.
    const home = req.searchParams.get("home")?.split(",") ?? []
    const rows = readList("services", seedServices)
      .filter((s) => !q || s.name_en.toLocaleLowerCase().includes(q) || s.name_ar.includes(q))
      .filter((s) => statuses.length === 0 || statuses.includes(s.hidden ? "hidden" : "visible"))
      .filter((s) => home.length === 0 || home.includes(s.show_in_home ? "yes" : "no"))
      .sort(compareBy<Service>(sort, req.searchParams.get("order") === "desc"))
    return json({ data: rows.slice((page - 1) * size, page * size), total: rows.length })
  },

  "GET /services/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const service = readList("services", seedServices).find((s) => s.id === req.params.id)
    return service ? json(service) : json({ message: "Not found" }, 404)
  },

  "POST /services": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as ServiceInput
    if (!input.icon_url || !input.image_url) return json({ message: "An icon and a picture are required" }, 422)
    const service: Service = { ...input, id: `srv_${Date.now().toString(36)}`, created_at: new Date().toISOString() }
    writeStore("services", [...readList("services", seedServices), service])
    return json(service, 201)
  },

  "PUT /services/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const input = req.body as ServiceInput
    const list = readList("services", seedServices)
    const current = list.find((s) => s.id === req.params.id)
    if (!current) return json({ message: "Not found" }, 404)
    if (!input.icon_url || !input.image_url) return json({ message: "An icon and a picture are required" }, 422)
    const updated = { ...current, ...input }
    writeStore("services", list.map((s) => (s.id === current.id ? updated : s)))
    return json(updated)
  },

  "DELETE /services/:id": (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const list = readList("services", seedServices)
    if (!list.some((s) => s.id === req.params.id)) return json({ message: "Not found" }, 404)
    writeStore("services", list.filter((s) => s.id !== req.params.id))
    return new Response(null, { status: 204 })
  },

  "POST /uploads": async (req) => {
    if (!isAuthorized(req)) return unauthorized()
    const file = req.body instanceof FormData ? req.body.get("file") : null
    if (!(file instanceof File)) return json({ message: "No file provided" }, 422)
    if (file.size > MAX_UPLOAD_BYTES) return json({ message: "File is too large" }, 413)
    return json({ url: await toDataUrl(file) })
  },
}

// Routes may contain :param segments, e.g. "GET /countries/:id".
const compiled = Object.entries(routes).map(([key, handler]) => {
  const [method, pattern] = key.split(" ")
  const names: string[] = []
  const regex = new RegExp(
    `^${pattern.replace(/:(\w+)/g, (_, name: string) => {
      names.push(name)
      return "([^/]+)"
    })}$`
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
    init?.body instanceof FormData
      ? init.body
      : typeof init?.body === "string"
        ? JSON.parse(init.body)
        : undefined
  return match.handler({
    params: match.params,
    body,
    headers: new Headers(init?.headers),
    searchParams: url.searchParams,
  })
}

