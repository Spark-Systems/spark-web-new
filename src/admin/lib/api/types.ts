
export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type?: string
  /** Access token lifetime in seconds. */
  expires_in?: number
  /** Refresh token lifetime in seconds. */
  refresh_expires_in?: number
}

export interface LoginPayload {
  email: string
  password: string
}

export type UserRole = "admin" | "editor" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url: string | null
}

export interface MetaSettings {
  name_en: string
  name_ar: string
  /** HTML from the rich text editor. */
  meta_description_en: string
  meta_description_ar: string
  keywords_en: string[]
  keywords_ar: string[]
}

export const socialPlatforms = ["facebook", "instagram", "x", "linkedin", "youtube"] as const
export type SocialPlatform = (typeof socialPlatforms)[number]

export interface SocialLink {
  url: string
  /** Stored icon (SVG) URL, or null when none was uploaded. */
  icon_url: string | null
}

export type SocialLinks = Record<SocialPlatform, SocialLink>

export interface UploadResult {
  url: string
}

export interface AdvancedSettings {
  website_url: string
  smtp_host: string
  smtp_port: number
  /** SMTP username ("email sender"). */
  smtp_username: string
  /** Write-only: always "" from the API; send "" to keep the stored password. */
  smtp_password: string
  smtp_password_set: boolean
  smtp_use_ssl: boolean
  default_email_address: string
  default_email_name: string
  notification_email: string
  recaptcha_site_key: string
  /** Write-only, like smtp_password. */
  recaptcha_secret_key: string
  recaptcha_secret_set: boolean
  google_analytics_code: string
  google_analytics_emails: string[]
  seo_scripts: string
}

export type AdvancedSettingsUpdate = Omit<AdvancedSettings, "smtp_password_set" | "recaptcha_secret_set">

/** Standard list response for server-side tables. */
export interface Paginated<T> {
  data: T[]
  /** Total rows matching the filters, across all pages. */
  total: number
}

/** Query sent with every list request. Facet filters go as comma lists, e.g. status=visible,hidden. */
export interface ListParams {
  page: number
  page_size: number
  sort?: string
  order?: "asc" | "desc"
  q?: string
  [filter: string]: string | number | undefined
}

/**
 * Icon keys the website can draw (its <Icon> registry). Services and solutions
 * reference icons by key, so the admin offers these instead of uploads.
 */
export const siteIcons = [
  "armchair", "bank", "chart-bar", "chart-line-up", "cloud", "code", "cube", "cursor-click",
  "device-mobile", "flag", "flow-arrow", "globe", "handshake", "identification-badge",
  "identification-card", "layout", "magnifying-glass", "map-pin", "paint-brush", "pen-nib",
  "plugs-connected", "qr-code", "scan", "shield-check", "shopping-cart", "sparkle", "storefront",
  "ticket", "tree-structure", "trophy", "truck",
] as const
export type SiteIcon = (typeof siteIcons)[number]

/** A service area (the website's /services page and /services/[slug]). */
export interface SiteService {
  id: string
  /** URL segment, e.g. "design" for /services/design. */
  slug: string
  name_en: string
  name_ar: string
  /** One-line pitch, shown large. */
  summary_en: string
  summary_ar: string
  /** A longer paragraph under the pitch. */
  description_en: string
  description_ar: string
  /** What the area covers ("UX research", "UI design", …). */
  capabilities_en: string[]
  capabilities_ar: string[]
  icon: SiteIcon
  /** Stored picture URL. */
  image_url: string
  /** Has its own detail page; otherwise links go to the contact form. */
  has_detail: boolean
  /** Display order, lowest first. */
  order: number
  hidden: boolean
  created_at: string
}

export type SiteServiceInput = Omit<SiteService, "id" | "created_at">

/** A solution in the catalogue (the website's /solutions page and /solutions/[slug]). */
export interface Solution {
  id: string
  /** URL segment, e.g. "ticketing" for /solutions/ticketing. */
  slug: string
  name_en: string
  name_ar: string
  /** Stored picture URL. */
  image_url: string
  /** Shown as a large stacking card in "Flagship platforms". */
  flagship: boolean
  /** Flagship card text; "" when not a flagship. */
  description_en: string
  description_ar: string
  /** Flagship card tags. */
  tags_en: string[]
  tags_ar: string[]
  icon: SiteIcon
  /** Has its own detail page; otherwise links go to the contact form. */
  has_detail: boolean
  /** Display order, lowest first. */
  order: number
  hidden: boolean
  created_at: string
}

export type SolutionInput = Omit<Solution, "id" | "created_at">

/** A company shown by its logo, e.g. a client or a partner. */
export interface LogoItem {
  id: string
  name_en: string
  name_ar: string
  /** Stored PNG logo URL. */
  logo_url: string
  /** The company's website; "" when there's none. */
  link: string
  /** Display order, lowest first. */
  order: number
  hidden: boolean
  created_at: string
}

export type LogoItemInput = Omit<LogoItem, "id" | "created_at">
