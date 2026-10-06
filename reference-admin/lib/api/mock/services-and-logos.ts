import type { LogoItem, Service } from "../types"
import { bannerPicture } from "./countries"

const svg = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#B9383A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  )}`

// Simple line icons for the seeded services.
const ICONS = [
  svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  svg('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
  svg('<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 0 0-6V6H3z"/><path d="M13 6v12"/>'),
  svg('<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 1 0 6 16.5"/><path d="M7 19h10.5"/>'),
  svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
]

const palettes: [string, string][] = [
  ["#050505", "#b9383a"],
  ["#b9383a", "#5a1a1b"],
  ["#1f1f1f", "#8c8c8c"],
]

const SERVICES: [string, string][] = [
  ["Custom software", "البرمجيات المخصصة"],
  ["Mobile apps", "تطبيقات الجوال"],
  ["Ticketing systems", "أنظمة التذاكر"],
  ["Cloud hosting", "الاستضافة السحابية"],
  ["Support & maintenance", "الدعم والصيانة"],
]

export const seedServices: Service[] = SERVICES.map(([name_en, name_ar], i) => ({
  id: `srv_${String(i + 1).padStart(3, "0")}`,
  name_en,
  name_ar,
  summary_en: `${name_en} delivered by the Spark Systems team.`,
  summary_ar: `${name_ar} يقدّمها فريق سبارك سيستمز.`,
  content_en: `<h2>${name_en}</h2><p>We plan, build and support <strong>${name_en.toLowerCase()}</strong> for businesses of every size.</p>`,
  content_ar: `<h2>${name_ar}</h2><p>نخطط وننفذ وندعم <strong>${name_ar}</strong> للشركات بمختلف أحجامها.</p>`,
  icon_url: ICONS[i % ICONS.length],
  image_url: bannerPicture(name_en, ...palettes[i % palettes.length]),
  show_in_home: i < 3,
  order: (i + 1) * 10,
  hidden: i === 4,
  created_at: new Date(Date.UTC(2026, 6, 1 + i)).toISOString(),
}))

/** A wordmark-style placeholder logo (SVG data URL) for seeded companies. */
const logo = (label: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80"><rect width="240" height="80" rx="10" fill="#fff"/><circle cx="40" cy="40" r="18" fill="${color}"/><text x="70" y="49" font-family="Arial" font-size="24" font-weight="700" fill="#050505">${label.replace(/&/g, "&amp;")}</text></svg>`
  )}`

const logoItems = (prefix: string, names: [string, string, string][], day: number): LogoItem[] =>
  names.map(([name_en, name_ar, link], i) => ({
    id: `${prefix}_${String(i + 1).padStart(3, "0")}`,
    name_en,
    name_ar,
    logo_url: logo(name_en.split(" ")[0], ["#B9383A", "#050505", "#6B7280", "#2563EB"][i % 4]),
    link,
    order: (i + 1) * 10,
    hidden: i === names.length - 1,
    created_at: new Date(Date.UTC(2026, 7, day + i)).toISOString(),
  }))

export const seedClients = logoItems(
  "cli",
  [
    ["Nile Bank", "بنك النيل", "https://example.com/nile-bank"],
    ["Delta Retail", "دلتا للتجزئة", "https://example.com/delta"],
    ["Cairo Events", "القاهرة للفعاليات", "https://example.com/cairo-events"],
    ["Gulf Logistics", "الخليج للخدمات اللوجستية", ""],
    ["Pyramid Clinics", "عيادات الهرم", "https://example.com/pyramid"],
  ],
  1
)

export const seedPartners = logoItems(
  "par",
  [
    ["Cloudline", "كلاودلاين", "https://example.com/cloudline"],
    ["PrintPro", "برنت برو", "https://example.com/printpro"],
    ["SecureGate", "سكيور جيت", "https://example.com/securegate"],
    ["DataWave", "داتا ويف", ""],
  ],
  10
)
