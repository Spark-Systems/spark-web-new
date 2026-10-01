import aws from "@/assets/images/partners/aws.svg";
import microsoft from "@/assets/images/partners/microsoft.svg";
import type { NavLink, Partner } from "@/types/content";

export const siteConfig = {
  name: "Spark Systems",
  description:
    "Intelligent solutions, always delivered. Since 2008 Spark Systems has built the platforms organisations across the Middle East depend on every day.",
  email: "info@spark-sys.com",
  foundedYear: 2008,
} as const;

/** Inline links shown in the header and floating nav on desktop. */
export const primaryNav: NavLink[] = [
  { label: "Solutions", href: "#solutions" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
];

export const contactCta: NavLink = { label: "Talk to us", href: "#contact" };

/** Full-screen menu. Point the "#" entries at routes as those pages are added. */
export const menuNav: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Solutions", href: "#solutions" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#" },
  { label: "Insights", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#contact" },
];

export const solutionNames = [
  "Ticketing",
  "Accreditation",
  "Distribution & Orders",
  "Governmental",
  "Enterprise HR & CRM",
  "LMS",
  "E-commerce",
  "Medical",
  "POS & Reservations",
  "Real Estate",
  "Travel",
  "Directory",
  "Corporate",
  "Custom",
];

export const companyNav: NavLink[] = ["About", "Work", "Services", "Insights", "Careers", "Contact"].map(
  (label) => ({ label, href: "#" }),
);

export const offices = ["New Cairo (HQ), Egypt", "Sheikh Zayed, Egypt", "Riyadh, Saudi Arabia", "Dubai, UAE"];

export const socialLinks: NavLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/sparksystems/" },
  { label: "Instagram", href: "https://www.instagram.com/spark.systems/" },
  { label: "X", href: "https://x.com/Spark_systems" },
  { label: "YouTube", href: "#" },
  { label: "WhatsApp", href: "#" },
];

export const partners: Partner[] = [
  { name: "AWS", logo: aws, invert: true },
  { name: "Microsoft", logo: microsoft, showName: true },
];
