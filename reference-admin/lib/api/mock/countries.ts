import type { BannerSection, Country, InternalBanner } from "../types"

const SEED: [string, string][] = [
  ["Egypt", "مصر"], ["Saudi Arabia", "المملكة العربية السعودية"], ["United Arab Emirates", "الإمارات العربية المتحدة"],
  ["Kuwait", "الكويت"], ["Qatar", "قطر"], ["Bahrain", "البحرين"], ["Oman", "عُمان"], ["Jordan", "الأردن"],
  ["Lebanon", "لبنان"], ["Iraq", "العراق"], ["Syria", "سوريا"], ["Palestine", "فلسطين"], ["Yemen", "اليمن"],
  ["Morocco", "المغرب"], ["Algeria", "الجزائر"], ["Tunisia", "تونس"], ["Libya", "ليبيا"], ["Sudan", "السودان"],
  ["Mauritania", "موريتانيا"], ["Somalia", "الصومال"], ["Djibouti", "جيبوتي"], ["Comoros", "جزر القمر"],
  ["United States", "الولايات المتحدة"], ["United Kingdom", "المملكة المتحدة"], ["Germany", "ألمانيا"],
  ["France", "فرنسا"], ["Italy", "إيطاليا"], ["Spain", "إسبانيا"], ["Turkey", "تركيا"], ["China", "الصين"],
  ["Japan", "اليابان"], ["India", "الهند"], ["Singapore", "سنغافورة"], ["Canada", "كندا"], ["Australia", "أستراليا"],
  ["Brazil", "البرازيل"], ["Seychelles", "سيشل"], ["Netherlands", "هولندا"], ["Sweden", "السويد"], ["South Africa", "جنوب أفريقيا"],
]

export const seedCountries: Country[] = SEED.map(([name_en, name_ar], i) => ({
  id: `cty_${String(i + 1).padStart(3, "0")}`,
  name_en,
  name_ar,
  order: i < 22 ? (i + 1) * 10 : 500 + i,
  hidden: name_en === "Seychelles",
  created_at: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
}))

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Simple wide placeholder picture (SVG data URL) so seeded banners have a preview. */
export const bannerPicture = (label: string, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 400"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1920" height="400" fill="url(#g)"/><text x="960" y="235" text-anchor="middle" font-family="Arial" font-size="110" font-weight="700" fill="#fff">${escapeXml(label)}</text></svg>`
  )}`

const BANNER_SEED: [BannerSection, string, string, boolean][] = [
  ["about", "About Spark Systems", "عن سبارك سيستمز", false],
  ["services", "Our services", "خدماتنا", false],
  ["products", "Our products", "منتجاتنا", false],
  ["clients", "Our clients", "عملاؤنا", false],
  ["partners", "Our partners", "شركاؤنا", true],
  ["news_events", "News & events", "الأخبار والفعاليات", false],
  ["photos", "Photo gallery", "معرض الصور", false],
  ["videos", "Video gallery", "معرض الفيديو", false],
  ["careers", "Join our team", "انضم إلى فريقنا", false],
  ["contact", "Get in touch", "تواصل معنا", true],
]

const palettes: [string, string][] = [
  ["#050505", "#b9383a"],
  ["#b9383a", "#5a1a1b"],
  ["#1f1f1f", "#8c8c8c"],
]

export const seedBanners: InternalBanner[] = BANNER_SEED.map(([section, name_en, name_ar, no_image], i) => ({
  id: `bnr_${String(i + 1).padStart(3, "0")}`,
  section,
  name_en,
  name_ar,
  image_url: no_image ? null : bannerPicture(name_en, ...palettes[i % palettes.length]),
  no_image,
  created_at: new Date(Date.UTC(2026, 1, 1 + i)).toISOString(),
}))
