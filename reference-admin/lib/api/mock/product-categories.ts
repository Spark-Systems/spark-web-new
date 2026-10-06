import type { ProductCategory } from "../types"
import { bannerPicture } from "./countries"

/** What the mock stores; `parent` and `children_count` are worked out per response. */
export type StoredCategory = Omit<ProductCategory, "parent" | "children_count">

const palettes: [string, string][] = [
  ["#050505", "#b9383a"],
  ["#b9383a", "#5a1a1b"],
  ["#1f1f1f", "#8c8c8c"],
]

// [id, English, Arabic, parent id]
const SEED: [string, string, string, string | null][] = [
  ["cat_001", "Software", "البرمجيات", null],
  ["cat_002", "Hardware", "الأجهزة", null],
  ["cat_003", "Ticketing", "أنظمة التذاكر", null],
  ["cat_004", "Digital services", "الخدمات الرقمية", null],
  ["cat_005", "ERP systems", "أنظمة تخطيط الموارد", "cat_001"],
  ["cat_006", "Mobile apps", "تطبيقات الجوال", "cat_001"],
  ["cat_007", "POS terminals", "أجهزة نقاط البيع", "cat_002"],
  ["cat_008", "Printers", "الطابعات", "cat_002"],
  ["cat_009", "Event tickets", "تذاكر الفعاليات", "cat_003"],
  ["cat_010", "Access control", "التحكم في الدخول", "cat_003"],
  ["cat_011", "Cloud hosting", "الاستضافة السحابية", "cat_004"],
]

export const seedProductCategories: StoredCategory[] = SEED.map(([id, name_en, name_ar, parent_id], i) => ({
  id,
  name_en,
  name_ar,
  image_url: bannerPicture(name_en, ...palettes[i % palettes.length]),
  parent_id,
  order: (i + 1) * 10,
  hidden: name_en === "Access control",
  created_at: new Date(Date.UTC(2026, 3, 1 + i)).toISOString(),
}))
