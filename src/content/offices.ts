import type { ContactLine, Office } from "@/types/contact";

const egyptMobile: ContactLine = { type: "mobile", label: "Mobile", value: "+20 (11) 40 88 6688", href: "tel:+201140886688" };
const egyptEmail: ContactLine = { type: "email", label: "Email", value: "sparkeg@spark-sys.com", href: "mailto:sparkeg@spark-sys.com" };

/** Spark's offices, HQ first. The single source for the contact page, footer and menu. */
export const offices: Office[] = [
  {
    id: "cairo",
    city: "Cairo",
    country: "Egypt",
    hq: true,
    timeZone: "Africa/Cairo",
    address: "Villa 117, Al-Narges 4, 5th Settlement, Cairo, Egypt",
    mapUrl: "https://maps.app.goo.gl/NM9tQmVSoVeJvDNW6",
    lines: [{ type: "phone", label: "Tel", value: "02 (2) 641 7015", href: "tel:+20226417015" }, egyptMobile, egyptEmail],
  },
  {
    id: "giza",
    city: "Giza",
    country: "Egypt",
    timeZone: "Africa/Cairo",
    address: "Villa 99, Area 3, District 8, Sheikh Zayed City, Giza, Egypt",
    mapUrl: "https://maps.app.goo.gl/MgeRiSus7fHLZ6HZA",
    lines: [{ type: "phone", label: "Tel", value: "+20 (2) 379 57 021", href: "tel:+20237957021" }, egyptMobile, egyptEmail],
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    timeZone: "Asia/Dubai",
    address: "Dubai Shopping Center Office FF-45, Dubai, UAE",
    mapUrl: "https://maps.app.goo.gl/4ZtmrZ9f4m2Y1zKA6",
    lines: [
      { type: "mobile", label: "Mobile", value: "+971 509309480", href: "tel:+971509309480" },
      { type: "mobile", label: "Mobile", value: "+971 509409530", href: "tel:+971509409530" },
      { type: "email", label: "Email", value: "sparkuae@spark-sys.com", href: "mailto:sparkuae@spark-sys.com" },
    ],
  },
  {
    id: "riyadh",
    city: "Riyadh",
    country: "Saudi Arabia",
    timeZone: "Asia/Riyadh",
    address: "Imam Saud bin Faisal, Riyadh, KSA",
    mapUrl: "https://maps.app.goo.gl/h4n8zw6xSdmy3esE9",
    lines: [{ type: "email", label: "Email", value: "sparkksa@spark-sys.com", href: "mailto:sparkksa@spark-sys.com" }],
  },
];

/** "Cairo (HQ), Egypt" — the label used in lists like the footer. */
export const officeLabel = (o: Office) => `${o.city}${o.hq ? " (HQ)" : ""}, ${o.country}`;
