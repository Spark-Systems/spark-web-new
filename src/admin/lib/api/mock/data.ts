import type { AdvancedSettingsUpdate, MetaSettings, SocialLinks, User } from "../types"

/**
 * Credentials accepted by the mock /auth/login endpoint, set in .env.local.
 * Without a password the mock login rejects every attempt.
 */
export const MOCK_CREDENTIALS = {
  email: (process.env.NEXT_PUBLIC_MOCK_ADMIN_EMAIL ?? "admin@spark-sys.com").toLowerCase(),
  password: process.env.NEXT_PUBLIC_MOCK_ADMIN_PASSWORD ?? "",
}

export const mockAdmin: User = {
  id: "usr_001",
  name: "Spark Admin",
  email: MOCK_CREDENTIALS.email,
  role: "admin",
  avatar_url: null,
}

export const defaultMetaSettings: MetaSettings = {
  name_en: "Spark Systems",
  name_ar: "سبارك سيستمز",
  meta_description_en:
    "<p>Spark Systems builds <strong>software, ticketing and digital solutions</strong> for businesses across the region.</p>",
  meta_description_ar: "<p>تقدّم سبارك سيستمز <strong>حلول البرمجيات والتذاكر والحلول الرقمية</strong> للشركات في المنطقة.</p>",
  keywords_en: ["software", "ticketing", "digital solutions"],
  keywords_ar: ["برمجيات", "تذاكر", "حلول رقمية"],
}

export const defaultSocialLinks: SocialLinks = {
  facebook: { url: "https://www.facebook.com/Spark.Systems", icon_url: null },
  instagram: { url: "https://www.instagram.com/spark.systems/", icon_url: null },
  x: { url: "https://x.com/Spark_systems", icon_url: null },
  linkedin: { url: "https://www.linkedin.com/company/sparksystems/", icon_url: null },
  youtube: { url: "", icon_url: null },
}

/** Stored form, secrets included; the API strips them before responding. */
export const defaultAdvancedSettings: AdvancedSettingsUpdate = {
  website_url: "https://www.spark-sys.com",
  smtp_host: "smtp.office365.com",
  smtp_port: 587,
  smtp_username: "no-reply@spark-sys.com",
  smtp_password: "mock-smtp-password",
  smtp_use_ssl: false,
  default_email_address: "no-reply@spark-sys.com",
  default_email_name: "Spark Systems",
  notification_email: "info@spark-sys.com",
  recaptcha_site_key: "6LcMockSiteKey000000000000000000000000000",
  recaptcha_secret_key: "",
  google_analytics_code: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-XXXXXXX");
</script>`,
  google_analytics_emails: ["marketing@spark-sys.com"],
  seo_scripts: "",
}
