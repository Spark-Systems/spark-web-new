import aws from "@/assets/images/partners/aws.svg";
import microsoft from "@/assets/images/partners/microsoft.svg";
import aiImg from "@/assets/images/services/ai.png";
import designImg from "@/assets/images/services/design.png";
import governmentalImg from "@/assets/images/solutions/governmental.png";
import ticketingImg from "@/assets/images/solutions/ticketing.png";
import ourWorkImg from "@/assets/images/work/our-work.png";
import selaImg from "@/assets/images/work/sela.png";
import type { MenuItem, NavLink, Partner } from "@/types/content";

export const siteConfig = {
  name: "Spark Systems",
  description:
    "Intelligent solutions, always delivered. Since 2008 Spark Systems has built the platforms organisations across the Middle East depend on every day.",
  email: "info@spark-sys.com",
  phone: { label: "+20 (11) 40 88 6688", href: "tel:+201140886688" },
  foundedYear: 2008,
} as const;

/**
 * Route paths. Home sections are linked page-qualified ("/#work") so the links
 * work from every page (see <SmartLink />).
 */
export const routes = {
  home: "/",
  about: "/about",
  solutions: "/solutions",
  solution: (slug: string) => `/solutions/${slug}`,
  services: "/services",
  service: (slug: string) => `/services/${slug}`,
  contact: "/contact",
  work: "/work",
  project: (slug: string) => `/work/${slug}`,
} as const;

/** Inline links shown in the header and floating nav on desktop. */
export const primaryNav: NavLink[] = [
  { label: "Solutions", href: routes.solutions },
  { label: "Services", href: routes.services },
  { label: "Work", href: routes.work },
];

export const contactCta: NavLink = { label: "Talk to us", href: "#contact" };

/**
 * Full-screen menu: main entries, each with the preview shown while hovered.
 * Point the "#" entries at routes as those pages are added.
 */
export const menuNav: MenuItem[] = [
  {
    label: "Home",
    href: routes.home,
    brief: "Software for events, ticketing and government services, built in Cairo.",
    image: ourWorkImg,
  },
  {
    label: "Solutions",
    href: routes.solutions,
    brief: "Ready platforms for ticketing, accreditation, distribution and government services.",
    image: ticketingImg,
  },
  {
    label: "Services",
    href: routes.services,
    brief: "Design, development, mobile, AI, cloud and cybersecurity, delivered by one team.",
    image: designImg,
  },
  {
    label: "Work",
    href: routes.work,
    brief: "Selected projects for TicketMX, Sela, the Ministry of Foreign Affairs and more.",
    image: selaImg,
  },
  {
    label: "About",
    href: routes.about,
    brief: "Who we are: a Cairo software company with offices across Egypt, Saudi Arabia and the UAE.",
    image: governmentalImg,
  },
  {
    label: "Contact",
    href: routes.contact,
    brief: "Tell us about your project and we will get back to you.",
    image: aiImg,
  },
];

/** Smaller links listed under the main menu entries. */
export const menuSecondaryNav: NavLink[] = [
  { label: "Insights", href: "#" },
  { label: "Careers", href: "#" },
];

export const companyNav: NavLink[] = [
  { label: "About", href: routes.about },
  { label: "Work", href: routes.work },
  { label: "Services", href: routes.services },
  { label: "Insights", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: routes.contact },
];


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
