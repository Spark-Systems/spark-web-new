import type { LinkTarget } from "@/lib/links"

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

export interface Country {
  id: string
  name_en: string
  name_ar: string
  order: number
  hidden: boolean
  created_at: string
}

export type CountryInput = Pick<Country, "name_en" | "name_ar" | "order" | "hidden">

export interface ImportResult {
  created: number
  /** Rows skipped because a country with the same name already exists. */
  skipped: number
}

export const bannerSections = [
  "about",
  "services",
  "products",
  "clients",
  "partners",
  "news_events",
  "photos",
  "videos",
  "downloads",
  "faqs",
  "careers",
  "contact",
] as const
export type BannerSection = (typeof bannerSections)[number]

export interface InternalBanner {
  id: string
  section: BannerSection
  name_en: string
  name_ar: string
  /** Stored picture URL; null when there's no picture. */
  image_url: string | null
  /** The page header is shown without a picture. */
  no_image: boolean
  created_at: string
}

export type BannerInput = Pick<InternalBanner, "section" | "name_en" | "name_ar" | "image_url" | "no_image">

/** One block of the website's About Us page (e.g. "Who we are", "Our vision"). */
export interface AboutSection {
  id: string
  name_en: string
  name_ar: string
  /** Rich text HTML; may contain images. */
  description_en: string
  description_ar: string
  /** Stored picture URL. */
  image_url: string
  /** Display order on the website, lowest first. */
  order: number
  hidden: boolean
  /** Photo gallery, in display order. */
  gallery: GalleryImage[]
  /** Rich text HTML for the page's meta description. */
  meta_description_en: string
  meta_description_ar: string
  keywords_en: string[]
  keywords_ar: string[]
  created_at: string
}

export interface GalleryImage {
  id: string
  url: string
  /** Original file name, shown in the admin. */
  name: string
}

export type AboutSectionInput = Omit<AboutSection, "id" | "created_at">

/** A product category. Categories are two levels deep: main categories and their subcategories. */
export interface ProductCategory {
  id: string
  name_en: string
  name_ar: string
  /** Stored picture URL. */
  image_url: string
  /** The main category this one belongs to; null for a main category. */
  parent_id: string | null
  /** Names of the parent, for display; null for a main category. */
  parent: Pick<ProductCategory, "id" | "name_en" | "name_ar"> | null
  /** Number of subcategories (always 0 for a subcategory). */
  children_count: number
  /** Display order on the website, lowest first. */
  order: number
  hidden: boolean
  created_at: string
}

export type ProductCategoryInput = Pick<ProductCategory, "name_en" | "name_ar" | "image_url" | "parent_id" | "order" | "hidden">

type CategoryRef = Pick<ProductCategory, "id" | "name_en" | "name_ar">

export interface Product {
  id: string
  category_id: string
  /** The product's category (and its main category when it's a subcategory), for display. */
  category: (CategoryRef & { parent: CategoryRef | null }) | null
  name_en: string
  name_ar: string
  /** Short plain-text description. */
  summary_en: string
  summary_ar: string
  /** Rich text HTML. */
  content_en: string
  content_ar: string
  /** Rich text HTML. */
  specifications_en: string
  specifications_ar: string
  /** Stored main picture URL. */
  image_url: string
  /** Optional link to a video (e.g. YouTube); "" when there is none. */
  video_url: string
  /** Display order on the website, lowest first. */
  order: number
  hidden: boolean
  /** Photo gallery, in display order. */
  gallery: GalleryImage[]
  meta_description_en: string
  meta_description_ar: string
  keywords_en: string[]
  keywords_ar: string[]
  created_at: string
}

export type ProductInput = Omit<Product, "id" | "category" | "created_at">

/** A slide in the home page banner. */
export interface HomeBanner {
  id: string
  headline1_en: string
  headline1_ar: string
  headline2_en: string
  headline2_ar: string
  headline3_en: string
  headline3_ar: string
  /** Picture shown on the English site. */
  image_en_url: string
  /** Picture shown on the Arabic site. */
  image_ar_url: string
  /** "" when the slide has no link. */
  link_en: string
  link_ar: string
  link_target: LinkTarget
  /** Display order, lowest first. */
  order: number
  hidden: boolean
  created_at: string
}

export type HomeBannerInput = Omit<HomeBanner, "id" | "created_at">

/** The welcome block on the home page (a single record). */
export interface WelcomeMessage {
  name_en: string
  name_ar: string
  /** Rich text HTML. */
  content_en: string
  content_ar: string
  image_url: string
  /** "" when there's no link. */
  link: string
  link_target: LinkTarget
  hidden: boolean
}

/** The contact block in the website footer (a single record). */
export interface FooterContact {
  name_en: string
  name_ar: string
  /** Rich text HTML. */
  content_en: string
  content_ar: string
}

/** A service the company offers (the website's Services section). */
export interface Service {
  id: string
  name_en: string
  name_ar: string
  /** Short plain-text description. */
  summary_en: string
  summary_ar: string
  /** Rich text HTML. */
  content_en: string
  content_ar: string
  /** Stored SVG icon URL. */
  icon_url: string
  /** Stored picture URL. */
  image_url: string
  /** Also listed in the home page's services block. */
  show_in_home: boolean
  /** Display order, lowest first. */
  order: number
  hidden: boolean
  created_at: string
}

export type ServiceInput = Omit<Service, "id" | "created_at">

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
