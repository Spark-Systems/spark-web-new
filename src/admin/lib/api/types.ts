import type { AdvancedSettingsRecord, UploadedImage } from "@/types/cms"

// The stored content model is shared with the server (src/types/cms.ts); this
// file adds what only the admin API's wire format needs.
export type {
  ActivityAction,
  ActivityEntry,
  CaseStudyContent,
  CollectionKey,
  CollectionMap,
  CollectionRow,
  Enquiry,
  EnquiryStatus,
  LogoRecord,
  MetaSettings,
  OfferingContent,
  OfficeRecord,
  PageContentMap,
  PageDocument,
  PageKey,
  ProjectRecord,
  PublishAction,
  PublishInfo,
  PublishStatus,
  ServiceRecord,
  SocialLinks,
  SocialPlatform,
  SolutionRecord,
  UploadedImage,
  User,
  UserRole,
} from "@/types/cms"
export { socialPlatforms } from "@/types/cms"
export { contentIcons as siteIcons, type ContentIcon as SiteIcon } from "@/lib/cms/icons"

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

/** POST /uploads: the stored picture (`url` repeats `src`). */
export type UploadResult = UploadedImage & { url: string }

/** Advanced settings as read: secrets come back empty, with flags saying whether they're set. */
export interface AdvancedSettings extends AdvancedSettingsRecord {
  smtp_password_set: boolean
  recaptcha_secret_set: boolean
}

/** Advanced settings as saved: an empty secret keeps the stored one. */
export type AdvancedSettingsUpdate = AdvancedSettingsRecord

/** Standard list response for server-side tables. */
export interface Paginated<T> {
  data: T[]
  /** Total rows matching the filters, across all pages. */
  total: number
}

/** Query sent with every list request. Facet filters go as comma lists, e.g. status=published,changed. */
export interface ListParams {
  page: number
  page_size: number
  sort?: string
  order?: "asc" | "desc"
  q?: string
  [filter: string]: string | number | undefined
}

export interface UserInput {
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  /** Required for a new user; "" keeps the current password when editing. */
  password: string
}

export interface EnquiryStats {
  new: number
  total: number
}
