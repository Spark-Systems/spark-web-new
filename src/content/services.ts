import aiImg from "@/assets/images/services/ai.png";
import cloudImg from "@/assets/images/services/cloud.png";
import cyberImg from "@/assets/images/services/cybersecurity.png";
import designImg from "@/assets/images/services/design.png";
import developmentImg from "@/assets/images/services/development.png";
import mobileImg from "@/assets/images/services/mobile.png";
import ticketingImg from "@/assets/images/solutions/ticketing.png";
import maakImg from "@/assets/images/work/maak.png";
import mfaImg from "@/assets/images/work/mfa.png";
import ourWorkImg from "@/assets/images/work/our-work.png";
import selaImg from "@/assets/images/work/sela.png";
import { routes } from "@/config/site";
import type { ServiceArea, ServiceDetail, ServicesPageData } from "@/types/services";
import { contactContent } from "./shared";

/** Where a service links: its detail page when it has one, otherwise the contact form. */
export const serviceHref = (s: Pick<ServiceArea, "slug" | "hasDetail">) =>
  s.hasDetail ? routes.service(s.slug) : "#contact";

const areas: ServiceArea[] = [
  {
    slug: "design",
    name: "Design",
    icon: "pen-nib",
    image: { src: designImg, alt: "Design" },
    summary: "Interfaces that make complex systems feel simple, from research and UX to brand identity.",
    description:
      "We start with research into how your users work, then shape flows, interfaces and design systems that stay consistent as your product grows.",
    capabilities: ["UX research", "UI design", "Design systems", "Brand identity"],
    hasDetail: true,
  },
  {
    slug: "development",
    name: "Development",
    icon: "code",
    image: { src: developmentImg, alt: "Development" },
    summary: "Web platforms and enterprise systems built from scratch.",
    description:
      "Our engineers build web platforms and enterprise systems from scratch, integrate them with the tools you already use, and keep them maintained after launch.",
    capabilities: ["Web platforms", "Enterprise systems", "Custom software", "System integration"],
    hasDetail: false,
  },
  {
    slug: "mobile",
    name: "Mobile",
    icon: "device-mobile",
    image: { src: mobileImg, alt: "Mobile" },
    summary: "Native-quality apps for field teams and customers.",
    description:
      "We build apps for iOS and Android, from field tools for your teams to customer super apps, and take them through to app store release.",
    capabilities: ["iOS & Android", "Flutter apps", "Super apps", "App store launch"],
    hasDetail: false,
  },
  {
    slug: "ai",
    name: "AI",
    icon: "sparkle",
    image: { src: aiImg, alt: "AI" },
    summary: "Prediction, recommendation and plain-language answers.",
    description:
      "We apply AI where it adds clear value: forecasting demand, recommending the next action and answering questions in plain language.",
    capabilities: ["Predictive models", "Recommendations", "AI assistants", "Automation"],
    hasDetail: false,
  },
  {
    slug: "cloud",
    name: "Cloud",
    icon: "cloud",
    image: { src: cloudImg, alt: "Cloud" },
    summary: "Infrastructure that holds at national scale.",
    description:
      "As AWS and Microsoft partners, we migrate, run and monitor infrastructure built to handle national-scale traffic, with disaster recovery in place.",
    capabilities: ["Cloud migration & consultation", "DevOps", "Disaster recovery", "AWS & Azure"],
    hasDetail: false,
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    icon: "shield-check",
    image: { src: cyberImg, alt: "Cybersecurity" },
    summary: "Protection built in from day one.",
    description:
      "We audit and test systems for weaknesses, secure access and identity, and monitor for threats so problems are found before they cause harm.",
    capabilities: ["Security audits", "Penetration testing", "Access & identity", "Monitoring"],
    hasDetail: false,
  },
];

/** Static services overview content, in the exact shape the content API will return. */
export const servicesPage: ServicesPageData = {
  seo: {
    title: "Services",
    description:
      "Design, development, mobile, AI, cloud and cybersecurity from one team at Spark Systems, from the first workshop to long after launch.",
  },
  hero: {
    eyebrow: "Services",
    titleLines: ["Design, build", "and run it", "with you."],
    image: { src: mfaImg, alt: "" },
  },
  areas: {
    eyebrow: "Our services",
    title: "Six services, one team.",
    items: areas,
  },
  approach: {
    eyebrow: "How we work",
    title: "From brief to running system.",
    lead: "One team carries the project from the first workshop to long after launch.",
    steps: [
      { title: "Discover", body: "We study the brief, the users and the systems already in place, then agree scope and timeline." },
      { title: "Design", body: "Interfaces and architecture are designed together, so what looks right also scales." },
      { title: "Build", body: "Agile sprints with regular demos. You see working software early and often." },
      { title: "Launch & support", body: "We deploy on AWS or Azure and stay on to monitor, maintain and improve." },
    ],
  },
  contact: contactContent,
};

/** Service detail pages by slug. Only services with `hasDetail` appear here. */
export const serviceDetails: Record<string, ServiceDetail> = {
  design: {
    slug: "design",
    seo: {
      title: "Design",
      description:
        "UX research, interface design, design systems and brand identity: products people understand at first use, designed by Spark Systems.",
    },
    hero: {
      eyebrow: "Services / Design",
      titleLines: ["Complex systems,", "made simple", "to use."],
      image: { src: designImg, alt: "" },
    },
    overview: {
      name: "Design",
      tags: ["UX research", "UI design", "Design systems", "Brand identity"],
      statement:
        "We design products that people understand at first use, from research and user experience to interfaces, design systems and brand identity.",
    },
    features: {
      eyebrow: "What it does",
      title: "From first sketch to final screen.",
      items: [
        {
          icon: "magnifying-glass",
          title: "UX research",
          body: "Interviews, analytics and usability testing that show how people really use your product.",
          image: { src: designImg, alt: "UX research session" },
        },
        {
          icon: "flow-arrow",
          title: "Information architecture",
          body: "User flows and structure that make large systems easy to navigate.",
          image: { src: mfaImg, alt: "Information architecture for a government portal" },
        },
        {
          icon: "layout",
          title: "UI design",
          body: "Clear, accessible interfaces for web and mobile, in Arabic and English.",
          image: { src: selaImg, alt: "Mobile app interface" },
        },
        {
          icon: "cube",
          title: "Design systems",
          body: "Reusable components and guidelines that keep every screen consistent as products grow.",
          image: { src: developmentImg, alt: "Design system components" },
        },
        {
          icon: "cursor-click",
          title: "Prototyping",
          body: "Clickable prototypes to test ideas with real users before development starts.",
          image: { src: maakImg, alt: "Clickable app prototype" },
        },
        {
          icon: "pen-nib",
          title: "Brand identity",
          body: "Logos, colour and type that carry your brand across every touchpoint.",
          image: { src: ourWorkImg, alt: "Brand identity work" },
        },
      ],
    },
    process: {
      eyebrow: "How it works",
      title: "How a design project runs.",
      steps: [
        { icon: "magnifying-glass", title: "Discover", body: "We study your users, goals and existing systems." },
        { icon: "tree-structure", title: "Define", body: "Flows and structure are agreed before any screens are drawn." },
        { icon: "paint-brush", title: "Design", body: "Interfaces are designed, prototyped and tested with users." },
        { icon: "handshake", title: "Hand off", body: "Developers get a documented design system ready to build." },
      ],
    },
    inUse: {
      eyebrow: "In use",
      title: "Designed by Spark.",
      cases: [
        { name: "Sela Super App", image: { src: selaImg, alt: "Sela Super App" }, href: routes.work },
        { name: "Saudi Tickets", image: { src: ticketingImg, alt: "Saudi Tickets" }, href: routes.project("saudi-tickets") },
        { name: "MFA Portal", image: { src: mfaImg, alt: "MFA Portal" }, href: routes.work },
      ],
    },
    contact: contactContent,
  },
};
