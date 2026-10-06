import { partners } from "@/config/site"
import { clients } from "@/content/home"
import { servicesPage } from "@/content/services"
import { solutionsPage } from "@/content/solutions"
import type { ImageSource } from "@/types/content"
import type { LogoItem, SiteIcon, SiteService, Solution } from "../types"

// Seed data for the mock backend, built from the website's own content files so
// the admin starts out showing exactly what the site shows. Arabic copy is a
// first draft for the demo and should be reviewed.

const SEEDED_AT = "2026-10-01T09:00:00.000Z"

/** URL of a static image import (or a remote URL as is). */
const url = (src: ImageSource) => (typeof src === "string" ? src : src.src)

// ---- Services ---------------------------------------------------------------

const servicesAr: Record<string, Pick<SiteService, "name_ar" | "summary_ar" | "description_ar" | "capabilities_ar">> = {
  design: {
    name_ar: "التصميم",
    summary_ar: "واجهات تجعل الأنظمة المعقدة سهلة الاستخدام، من البحث وتجربة المستخدم إلى الهوية البصرية.",
    description_ar:
      "نبدأ بدراسة طريقة عمل مستخدميك، ثم نصمم مسارات وواجهات وأنظمة تصميم تبقى متناسقة مع نمو منتجك.",
    capabilities_ar: ["أبحاث تجربة المستخدم", "تصميم الواجهات", "أنظمة التصميم", "الهوية البصرية"],
  },
  development: {
    name_ar: "التطوير",
    summary_ar: "منصات ويب وأنظمة مؤسسية تُبنى من الصفر.",
    description_ar:
      "يبني مهندسونا منصات الويب والأنظمة المؤسسية من الصفر، ويربطونها بالأدوات التي تستخدمها، ويواصلون صيانتها بعد الإطلاق.",
    capabilities_ar: ["منصات الويب", "الأنظمة المؤسسية", "برمجيات مخصصة", "تكامل الأنظمة"],
  },
  mobile: {
    name_ar: "تطبيقات الجوال",
    summary_ar: "تطبيقات بجودة أصلية لفرق العمل الميدانية والعملاء.",
    description_ar:
      "نبني تطبيقات iOS وAndroid، من أدوات فرقك الميدانية إلى التطبيقات الشاملة للعملاء، ونرافقها حتى النشر في المتاجر.",
    capabilities_ar: ["iOS وAndroid", "تطبيقات Flutter", "التطبيقات الشاملة", "النشر في المتاجر"],
  },
  ai: {
    name_ar: "الذكاء الاصطناعي",
    summary_ar: "التنبؤ والتوصية والإجابة بلغة طبيعية.",
    description_ar:
      "نطبّق الذكاء الاصطناعي حيث يضيف قيمة واضحة: توقّع الطلب، واقتراح الخطوة التالية، والإجابة عن الأسئلة بلغة واضحة.",
    capabilities_ar: ["نماذج تنبؤية", "التوصيات", "مساعدات ذكية", "الأتمتة"],
  },
  cloud: {
    name_ar: "الحوسبة السحابية",
    summary_ar: "بنية تحتية تصمد على المستوى الوطني.",
    description_ar:
      "بصفتنا شركاء لـ AWS ومايكروسوفت، ننقل البنية التحتية ونشغّلها ونراقبها لتتحمّل حركة على المستوى الوطني، مع خطط للتعافي من الكوارث.",
    capabilities_ar: ["الترحيل والاستشارات السحابية", "DevOps", "التعافي من الكوارث", "AWS وAzure"],
  },
  cybersecurity: {
    name_ar: "الأمن السيبراني",
    summary_ar: "حماية مدمجة منذ اليوم الأول.",
    description_ar:
      "نفحص الأنظمة ونختبرها بحثًا عن الثغرات، ونؤمّن الوصول والهويات، ونراقب التهديدات لاكتشاف المشكلات قبل أن تُحدث ضررًا.",
    capabilities_ar: ["تدقيق أمني", "اختبار الاختراق", "الوصول والهوية", "المراقبة"],
  },
}

export const seedServices: SiteService[] = servicesPage.areas.items.map((area, i) => ({
  id: `svc_${area.slug}`,
  slug: area.slug,
  name_en: area.name,
  summary_en: area.summary,
  description_en: area.description,
  capabilities_en: area.capabilities,
  ...(servicesAr[area.slug] ?? { name_ar: area.name, summary_ar: "", description_ar: "", capabilities_ar: [] }),
  icon: area.icon as SiteIcon,
  image_url: url(area.image.src),
  has_detail: area.hasDetail,
  order: (i + 1) * 10,
  hidden: false,
  created_at: SEEDED_AT,
}))

// ---- Solutions --------------------------------------------------------------

const solutionNamesAr: Record<string, string> = {
  ticketing: "التذاكر",
  accreditation: "الاعتماد",
  "distribution-orders": "التوزيع والطلبات",
  governmental: "الحلول الحكومية",
  "enterprise-hr-crm": "الموارد البشرية وإدارة العملاء للمؤسسات",
  lms: "أنظمة إدارة التعلم",
  "e-commerce": "التجارة الإلكترونية",
  medical: "الحلول الطبية",
  "real-estate": "العقارات",
  travel: "السفر",
  directory: "الأدلة",
  corporate: "الشركات",
  custom: "حلول مخصصة",
}

const flagshipsAr: Record<string, Pick<Solution, "description_ar" | "tags_ar">> = {
  ticketing: {
    description_ar: "البيع واختيار المقاعد والتحكم في الدخول والتقارير المباشرة للملاعب والمواسم والأندية.",
    tags_ar: ["المقاعد والمبيعات", "التحكم في الدخول", "تقارير مباشرة"],
  },
  accreditation: {
    description_ar: "التسجيل والتدقيق وطباعة البطاقات ومناطق الدخول للفعاليات الكبرى.",
    tags_ar: ["التسجيل", "التدقيق", "البطاقات والمناطق"],
  },
  "distribution-orders": {
    description_ar: "تسجيل الطلبات وتوجيه المسارات وتتبع التوصيل لفرق المبيعات الميدانية والموزعين.",
    tags_ar: ["الطلب الميداني", "توجيه المسارات", "تتبع التوصيل"],
  },
  governmental: {
    description_ar: "خدمات المواطنين وسير العمل الداخلي مبنية لتعمل على المستوى الوطني.",
    tags_ar: ["خدمات المواطنين", "سير العمل", "التكاملات"],
  },
}

/** Icons for catalogue entries that aren't flagships (flagships carry their own). */
const catalogIcons: Record<string, SiteIcon> = {
  "enterprise-hr-crm": "identification-card",
  lms: "layout",
  "e-commerce": "shopping-cart",
  medical: "plugs-connected",
  "real-estate": "map-pin",
  travel: "globe",
  directory: "magnifying-glass",
  corporate: "bank",
  custom: "code",
}

export const seedSolutions: Solution[] = solutionsPage.catalog.items.map((item, i) => {
  const flagship = solutionsPage.flagships.items.find((f) => f.slug === item.slug)
  return {
    id: `sol_${item.slug}`,
    slug: item.slug,
    name_en: item.name,
    name_ar: solutionNamesAr[item.slug] ?? item.name,
    image_url: url(item.image.src),
    flagship: Boolean(flagship),
    description_en: flagship?.description ?? "",
    tags_en: flagship?.tags ?? [],
    ...(flagshipsAr[item.slug] ?? { description_ar: "", tags_ar: [] }),
    icon: (flagship?.icon as SiteIcon | undefined) ?? catalogIcons[item.slug] ?? "sparkle",
    has_detail: item.hasDetail,
    order: (i + 1) * 10,
    hidden: false,
    created_at: SEEDED_AT,
  }
})

// ---- Clients and partners ---------------------------------------------------

const clientNamesAr: Record<string, string> = {
  "Ministry of Foreign Affairs": "وزارة الخارجية",
  "Saudi Arabia Railways": "الخطوط الحديدية السعودية",
  "Riyadh Season": "موسم الرياض",
  Toyota: "تويوتا",
  KAFD: "مركز الملك عبدالله المالي",
  Sela: "سيلا",
  "Amreyah Cement": "أسمنت العامرية",
  "Jeddah Events": "فعاليات جدة",
  "Ittihad Club": "نادي الاتحاد",
  "Abdul Rahman Al-Shareef Group": "مجموعة عبدالرحمن الشريف",
  "BLVD World": "بوليفارد وورلد",
  "Al Taawoun FC": "نادي التعاون",
}

const logoItem = (prefix: string, name: string, nameAr: string, logo: ImageSource, i: number): LogoItem => ({
  id: `${prefix}_${String(i + 1).padStart(3, "0")}`,
  name_en: name,
  name_ar: nameAr,
  logo_url: url(logo),
  link: "",
  order: (i + 1) * 10,
  hidden: false,
  created_at: SEEDED_AT,
})

export const seedClients: LogoItem[] = clients.map((c, i) => logoItem("cli", c.name, clientNamesAr[c.name] ?? c.name, c.logo, i))

const partnerNames: Record<string, [string, string]> = {
  AWS: ["Amazon Web Services", "أمازون ويب سيرفيسز"],
  Microsoft: ["Microsoft Azure", "مايكروسوفت أزور"],
}

export const seedPartners: LogoItem[] = partners.map((p, i) => {
  const [en, ar] = partnerNames[p.name] ?? [p.name, p.name]
  return logoItem("par", en, ar, p.logo, i)
})
