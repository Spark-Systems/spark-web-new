import type { FooterContact, HomeBanner, WelcomeMessage } from "../types"
import { bannerPicture } from "./countries"

// [first, second, third headline] in English, then Arabic, then the link path.
const SLIDES: [[string, string, string], [string, string, string], string][] = [
  [
    ["Software that moves", "your business forward", "ERP, HR and mobile apps"],
    ["برمجيات تدفع", "أعمالك إلى الأمام", "تخطيط الموارد والموارد البشرية وتطبيقات الجوال"],
    "/products",
  ],
  [
    ["Ticketing made simple", "for events of any size", "Print, scan and sell"],
    ["التذاكر بكل بساطة", "لفعاليات بأي حجم", "اطبع وامسح وبِع"],
    "/products/ticketing",
  ],
  [
    ["Hardware you can rely on", "POS terminals and printers", ""],
    ["أجهزة يمكنك الاعتماد عليها", "أجهزة نقاط البيع والطابعات", ""],
    "",
  ],
]

export const seedHomeBanners: HomeBanner[] = SLIDES.map(([en, ar, link], i) => ({
  id: `hb_${String(i + 1).padStart(3, "0")}`,
  headline1_en: en[0],
  headline2_en: en[1],
  headline3_en: en[2],
  headline1_ar: ar[0],
  headline2_ar: ar[1],
  headline3_ar: ar[2],
  image_en_url: bannerPicture(en[0], "#050505", "#b9383a"),
  image_ar_url: bannerPicture(`AR · ${i + 1}`, "#b9383a", "#5a1a1b"),
  link_en: link,
  link_ar: link,
  link_target: "_self",
  order: (i + 1) * 10,
  hidden: i === 2,
  created_at: new Date(Date.UTC(2026, 5, 1 + i)).toISOString(),
}))

export const defaultWelcomeMessage: WelcomeMessage = {
  name_en: "Welcome to Spark Systems",
  name_ar: "مرحبًا بكم في سبارك سيستمز",
  content_en:
    "<p>For more than fifteen years we have built <strong>software, ticketing and digital solutions</strong> for businesses across the region.</p>",
  content_ar:
    "<p>منذ أكثر من خمسة عشر عامًا نبني <strong>البرمجيات وأنظمة التذاكر والحلول الرقمية</strong> للشركات في المنطقة.</p>",
  image_url: bannerPicture("Welcome", "#050505", "#b9383a"),
  link: "/about-us",
  link_target: "_self",
  hidden: false,
}

export const defaultFooterContact: FooterContact = {
  name_en: "Get in touch",
  name_ar: "تواصل معنا",
  content_en: "<p>Cairo, Egypt<br>Phone: +20 2 0000 0000<br>Email: info@spark-sys.com</p>",
  content_ar: "<p>القاهرة، مصر<br>الهاتف: ‎+20 2 0000 0000<br>البريد الإلكتروني: info@spark-sys.com</p>",
}
