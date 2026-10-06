import aiImg from "@/assets/images/services/ai.png";
import developmentImg from "@/assets/images/services/development.png";
import accreditationImg from "@/assets/images/solutions/accreditation.png";
import distributionImg from "@/assets/images/solutions/distribution.png";
import governmentalImg from "@/assets/images/solutions/governmental.png";
import ticketingImg from "@/assets/images/solutions/ticketing.png";
import maakImg from "@/assets/images/work/maak.png";
import mfaImg from "@/assets/images/work/mfa.png";
import ourWorkImg from "@/assets/images/work/our-work.png";
import selaImg from "@/assets/images/work/sela.png";
import ticketmxImg from "@/assets/images/work/ticketmx.png";
import { routes } from "@/config/site";
import type { FlagshipSolution, SolutionDetail, SolutionSummary, SolutionsPageData } from "@/types/solutions";
import { contactContent, stockPhoto } from "./shared";

const summary = (slug: string, name: string, src: SolutionSummary["image"]["src"], hasDetail = false): SolutionSummary => ({
  slug,
  name,
  image: { src, alt: name },
  hasDetail,
});

/** Every solution, in display order. The single source for the catalogue grid and the footer. */
export const solutionCatalog: SolutionSummary[] = [
  summary("ticketing", "Ticketing", ticketingImg, true),
  summary("accreditation", "Accreditation", accreditationImg),
  summary("distribution-orders", "Distribution & Orders", distributionImg),
  summary("governmental", "Governmental", governmentalImg),
  summary("enterprise-hr-crm", "Enterprise HR & CRM", mfaImg),
  summary("lms", "LMS", maakImg),
  summary("e-commerce", "E-commerce", maakImg),
  summary("medical", "Medical", aiImg),
  summary("real-estate", "Real Estate", stockPhoto(13068366)),
  summary("travel", "Travel", selaImg),
  summary("directory", "Directory", ticketmxImg),
  summary("corporate", "Corporate", ourWorkImg),
  summary("custom", "Custom", developmentImg),
];

const bySlug = (slug: string) => {
  const found = solutionCatalog.find((s) => s.slug === slug);
  if (!found) throw new Error(`Unknown solution "${slug}"`);
  return found;
};

/** Where a solution links: its detail page when it has one, otherwise the contact form. */
export const solutionHref = (s: Pick<SolutionSummary, "slug" | "hasDetail">) =>
  s.hasDetail ? routes.solution(s.slug) : "#contact";

const flagships: FlagshipSolution[] = [
  {
    ...bySlug("ticketing"),
    icon: "ticket",
    description: "Sales, seating, access control and live reporting for venues, seasons and clubs.",
    tags: ["Seating & sales", "Access control", "Live reporting"],
  },
  {
    ...bySlug("accreditation"),
    icon: "identification-badge",
    description: "Registration, vetting, badge printing and access zones for large events.",
    tags: ["Registration", "Vetting", "Badges & zones"],
  },
  {
    ...bySlug("distribution-orders"),
    icon: "truck",
    description: "Order capture, routing and delivery tracking for field sales and distributors.",
    tags: ["Field ordering", "Routing", "Delivery tracking"],
  },
  {
    ...bySlug("governmental"),
    icon: "bank",
    description: "Citizen-facing services and back-office workflows built for national scale.",
    tags: ["Citizen services", "Workflows", "Integrations"],
  },
];

/** Static solutions overview content, in the exact shape the content API will return. */
export const solutionsPage: SolutionsPageData = {
  seo: {
    title: "Solutions",
    description:
      "Ticketing, accreditation, distribution, governmental platforms and more: the systems Spark Systems builds and runs at scale across Egypt and Saudi Arabia.",
  },
  hero: {
    eyebrow: "Solutions",
    titleLines: ["Platforms for", "work that", "can’t stop."],
    image: { src: governmentalImg, alt: "" },
  },
  flagships: {
    eyebrow: "Flagship platforms",
    title: "Four platforms we run at scale.",
    lead: "Each started as a custom build and now runs every day for clients across Egypt and Saudi Arabia.",
    items: flagships,
  },
  catalog: {
    eyebrow: "All solutions",
    title: "Thirteen ways we help organisations run.",
    items: solutionCatalog,
  },
  contact: contactContent,
};

/** Solution detail pages by slug. Only solutions with `hasDetail` appear here. */
export const solutionDetails: Record<string, SolutionDetail> = {
  ticketing: {
    slug: "ticketing",
    seo: {
      title: "Ticketing",
      description:
        "One platform for selling, seating, scanning and reporting, built for clubs, venues and seasons that sell to hundreds of thousands of fans.",
    },
    hero: {
      eyebrow: "Solutions / Ticketing",
      titleLines: ["Every seat,", "every gate,", "one system."],
      image: { src: ticketingImg, alt: "" },
    },
    overview: {
      name: "Ticketing",
      tags: ["Sports clubs", "Venues", "Seasons & festivals", "Concerts"],
      statement:
        "One platform for selling, seating, scanning and reporting. Built for clubs, venues and seasons that sell to hundreds of thousands of fans.",
    },
    features: {
      eyebrow: "What it does",
      title: "From first sale to final whistle.",
      items: [
        {
          icon: "storefront",
          title: "Online and box-office sales",
          body: "Web, app and counter sales from one inventory, so a seat is never sold twice.",
          image: { src: ticketingImg, alt: "Ticket sales across web, app and box office" },
        },
        {
          icon: "armchair",
          title: "Interactive seat maps",
          body: "Fans pick their exact seat on a live map of the venue, section by section.",
          image: { src: ticketmxImg, alt: "Interactive venue seat map" },
        },
        {
          icon: "qr-code",
          title: "Gate access control",
          body: "QR and barcode scanning at every gate, online or offline, with duplicate and fraud checks.",
          image: { src: accreditationImg, alt: "Ticket scanning at a stadium gate" },
        },
        {
          icon: "identification-card",
          title: "Season passes and memberships",
          body: "Recurring passes, member pricing and priority windows for loyal fans.",
          image: { src: selaImg, alt: "Season pass on a mobile app" },
        },
        {
          icon: "chart-line-up",
          title: "Live dashboards",
          body: "Sales, attendance and revenue by event, channel and gate, as it happens.",
          image: { src: ourWorkImg, alt: "Live sales dashboard" },
        },
        {
          icon: "plugs-connected",
          title: "Payments and integrations",
          body: "Local payment gateways, ERP and CRM connections, and open APIs for partners.",
          image: { src: maakImg, alt: "Payment and integration screens" },
        },
      ],
    },
    process: {
      eyebrow: "How it works",
      title: "A fan's journey in four steps.",
      steps: [
        { icon: "shopping-cart", title: "Buy", body: "Fans choose an event and seat online, in the app or at the box office." },
        { icon: "device-mobile", title: "Receive", body: "An e-ticket arrives instantly by app, email or SMS." },
        { icon: "scan", title: "Scan", body: "Gates validate each ticket in under a second." },
        { icon: "chart-bar", title: "Report", body: "Organisers see sales and attendance live." },
      ],
    },
    inUse: {
      eyebrow: "In use",
      title: "Where it runs today.",
      stat: { value: 1, suffix: "M+", label: "tickets a year on Saudi Tickets" },
      cases: [
        { name: "Saudi Tickets", image: { src: ticketingImg, alt: "Saudi Tickets" }, href: routes.project("saudi-tickets") },
        { name: "ticketMX", image: { src: ticketmxImg, alt: "ticketMX" }, href: routes.work },
        { name: "Sela Super App", image: { src: selaImg, alt: "Sela Super App" }, href: routes.work },
      ],
    },
    contact: contactContent,
  },
};
