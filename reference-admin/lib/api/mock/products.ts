import type { Product } from "../types"
import { bannerPicture } from "./countries"

/** What the mock stores; `category` is worked out per response. */
export type StoredProduct = Omit<Product, "category">

const palettes: [string, string][] = [
  ["#050505", "#b9383a"],
  ["#b9383a", "#5a1a1b"],
  ["#1f1f1f", "#8c8c8c"],
]

// [English, Arabic, category id]
const SEED: [string, string, string][] = [
  ["Spark ERP", "سبارك لتخطيط الموارد", "cat_005"],
  ["Spark HR", "سبارك للموارد البشرية", "cat_005"],
  ["Spark Go app", "تطبيق سبارك جو", "cat_006"],
  ["Retail POS T1", "نقطة بيع ريتيل T1", "cat_007"],
  ["Handheld POS H2", "نقطة بيع محمولة H2", "cat_007"],
  ["Thermal printer P80", "طابعة حرارية P80", "cat_008"],
  ["Ticket printer TK4", "طابعة تذاكر TK4", "cat_008"],
  ["Spark Tickets", "سبارك للتذاكر", "cat_009"],
  ["Turnstile gate G3", "بوابة دوارة G3", "cat_010"],
  ["Spark Cloud", "سبارك كلاود", "cat_011"],
  ["Software suite", "حزمة البرمجيات", "cat_001"],
  ["Support plan", "خطة الدعم", "cat_004"],
]

export const seedProducts: StoredProduct[] = SEED.map(([name_en, name_ar, category_id], i) => ({
  id: `prd_${String(i + 1).padStart(3, "0")}`,
  category_id,
  name_en,
  name_ar,
  summary_en: `${name_en} helps teams work faster with less effort.`,
  summary_ar: `يساعد ${name_ar} الفرق على العمل بسرعة وبجهد أقل.`,
  content_en: `<h2>Overview</h2><p><strong>${name_en}</strong> is built and supported by Spark Systems.</p>`,
  content_ar: `<h2>نظرة عامة</h2><p><strong>${name_ar}</strong> من تطوير ودعم سبارك سيستمز.</p>`,
  specifications_en: "<ul><li><p>Warranty: 2 years</p></li><li><p>Support: 24/7</p></li></ul>",
  specifications_ar: "<ul><li><p>الضمان: سنتان</p></li><li><p>الدعم: على مدار الساعة</p></li></ul>",
  image_url: bannerPicture(name_en, ...palettes[i % palettes.length]),
  video_url: i === 0 ? "https://www.youtube.com/watch?v=aqz-KE-bpKQ" : "",
  order: (i + 1) * 10,
  hidden: name_en === "Support plan",
  gallery:
    i < 2
      ? [1, 2, 3].map((n) => ({
          id: `prd_${i + 1}_photo_${n}`,
          url: bannerPicture(`Photo ${n}`, ...palettes[(i + n) % palettes.length]),
          name: `photo-${n}.png`,
        }))
      : [],
  meta_description_en: "",
  meta_description_ar: "",
  keywords_en: [],
  keywords_ar: [],
  created_at: new Date(Date.UTC(2026, 4, 1 + i)).toISOString(),
}))
