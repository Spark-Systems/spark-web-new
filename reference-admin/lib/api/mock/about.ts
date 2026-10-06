import type { AboutSection } from "../types"
import { bannerPicture } from "./countries"

const SEED: [string, string, string, string][] = [
  [
    "Who we are",
    "من نحن",
    "<p>Spark Systems is a <strong>software and digital solutions</strong> company serving businesses across the region since 2010.</p>",
    "<p>سبارك سيستمز شركة <strong>برمجيات وحلول رقمية</strong> تخدم الشركات في المنطقة منذ عام 2010.</p>",
  ],
  [
    "Our vision",
    "رؤيتنا",
    "<p>To be the most trusted technology partner for growing organizations.</p>",
    "<p>أن نكون شريك التقنية الأكثر ثقة للمؤسسات النامية.</p>",
  ],
  [
    "Our mission",
    "رسالتنا",
    "<p>We build reliable products that help our clients:</p><ul><li><p>Work faster</p></li><li><p>Serve their customers better</p></li></ul>",
    "<p>نبني منتجات موثوقة تساعد عملاءنا على:</p><ul><li><p>العمل بسرعة أكبر</p></li><li><p>خدمة عملائهم بشكل أفضل</p></li></ul>",
  ],
  [
    "Our values",
    "قيمنا",
    "<p>Integrity, quality and long-term partnerships guide everything we do.</p>",
    "<p>النزاهة والجودة والشراكات طويلة الأمد توجّه كل ما نقوم به.</p>",
  ],
  [
    "Our history",
    "تاريخنا",
    "<p>From a small team of engineers to a regional company with hundreds of projects delivered.</p>",
    "<p>من فريق صغير من المهندسين إلى شركة إقليمية نفّذت مئات المشاريع.</p>",
  ],
]

const palettes: [string, string][] = [
  ["#050505", "#b9383a"],
  ["#b9383a", "#5a1a1b"],
  ["#1f1f1f", "#8c8c8c"],
]

export const seedAboutSections: AboutSection[] = SEED.map(([name_en, name_ar, description_en, description_ar], i) => ({
  id: `abt_${String(i + 1).padStart(3, "0")}`,
  name_en,
  name_ar,
  description_en,
  description_ar,
  image_url: bannerPicture(name_en, ...palettes[i % palettes.length]),
  order: (i + 1) * 10,
  hidden: name_en === "Our history",
  // The first sections come with a few photos so the gallery has something to show.
  gallery:
    i < 2
      ? [1, 2, 3, 4].map((n) => ({
          id: `abt_${i + 1}_photo_${n}`,
          url: bannerPicture(`Photo ${n}`, ...palettes[(i + n) % palettes.length]),
          name: `photo-${n}.png`,
        }))
      : [],
  meta_description_en: i === 0 ? "<p>Learn who Spark Systems is and what drives our team.</p>" : "",
  meta_description_ar: i === 0 ? "<p>تعرّف على سبارك سيستمز وما يحرّك فريقنا.</p>" : "",
  keywords_en: i === 0 ? ["about", "company", "team"] : [],
  keywords_ar: i === 0 ? ["من نحن", "الشركة", "الفريق"] : [],
  created_at: new Date(Date.UTC(2026, 2, 1 + i)).toISOString(),
}))
