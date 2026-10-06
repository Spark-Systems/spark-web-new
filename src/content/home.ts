import aiImg from "@/assets/images/services/ai.png";
import cloudImg from "@/assets/images/services/cloud.png";
import cyberImg from "@/assets/images/services/cybersecurity.png";
import designImg from "@/assets/images/services/design.png";
import developmentImg from "@/assets/images/services/development.png";
import mobileImg from "@/assets/images/services/mobile.png";

import accreditationImg from "@/assets/images/solutions/accreditation.png";
import distributionImg from "@/assets/images/solutions/distribution.png";
import governmentalImg from "@/assets/images/solutions/governmental.png";
import ticketingImg from "@/assets/images/solutions/ticketing.png";

import maakImg from "@/assets/images/work/maak.png";
import mfaImg from "@/assets/images/work/mfa.png";
import ourWorkImg from "@/assets/images/work/our-work.png";
import selaWorkImg from "@/assets/images/work/sela.png";
import ticketmxImg from "@/assets/images/work/ticketmx.png";

import aag from "@/assets/images/clients/aag.png";
import altaawoun from "@/assets/images/clients/altaawoun.png";
import amreyah from "@/assets/images/clients/amreyah.png";
import blvdWorld from "@/assets/images/clients/blvd-world.png";
import ittihad from "@/assets/images/clients/ittihad.png";
import jeddahEvents from "@/assets/images/clients/jeddah-events.png";
import kafd from "@/assets/images/clients/kafd.png";
import mofa from "@/assets/images/clients/mofa.png";
import riyadhSeason from "@/assets/images/clients/riyadh-season.png";
import sar from "@/assets/images/clients/sar.png";
import sela from "@/assets/images/clients/sela.png";
import toyota from "@/assets/images/clients/toyota.png";

import { routes } from "@/config/site";
import type {
  AiCapability,
  ClientLogo,
  Project,
  Service,
  Solution,
  Stat,
  Testimonial,
} from "@/types/content";
import { solutionCatalog } from "./solutions";

export const hero = {
  titleStart: "Intelligent Solutions,",
  titleEnd: "Always Delivered.",
  /** Words cycled by the rotating label in the headline. */
  rotatingWords: solutionCatalog.map((s) => s.name),
  videoSrc: "https://di5qa23gsyh66.cloudfront.net/Project-Video-small_2.mp4",
  paragraphs: [
    "Since 2008, from our offices across the region, we've built the platforms that organisations depend on every day — at national scale, under real pressure, without fail.",
    "Today, every solution we build thinks. It predicts, recommends and decides. And when someone needs an answer, they simply ask.",
  ],
  stats: [
    { value: 18, suffix: "+", label: "years" },
    { value: 600, suffix: "+", label: "projects delivered" },
    { value: 4, label: "offices across 3 countries" },
  ] satisfies Stat[],
};

export const solutionsSection = {
  title: "Where we've gone deepest.",
  highlight: {
    value: "15M+",
    label: "users served",
    tbc: "[figure to confirm]",
  },
  cta: { label: "Explore All", href: routes.solutions },
};

export const solutions: Solution[] = [
  {
    id: "ticketing",
    title: "Ticketing",
    caption: "01 — 40M tickets issued to date",
    description:
      "Sell, scan and admit millions of fans without a queue at the gate.",
    image: ticketingImg,
    imageAlt: "TicketMX ticketing platform",
    theme: "brand",
    href: routes.solution("ticketing"),
  },
  {
    id: "distribution",
    title: "Distribution",
    caption: "02",
    description:
      "Every order, route and shelf in your field team’s hands, in real time.",
    image: distributionImg,
    imageAlt: "Distribution ordering app",
    theme: "navy",
    href: routes.solutions,
  },
  {
    id: "governmental",
    title: "Governmental",
    caption: "03",
    description:
      "Public services citizens complete online, in minutes, from anywhere.",
    image: governmentalImg,
    imageAlt: "Government portal",
    theme: "brand",
    href: routes.solutions,
  },
  {
    id: "accreditation",
    title: "Accreditation",
    caption: "04",
    description:
      "Every badge, zone and credential issued and verified before the doors open.",
    image: accreditationImg,
    imageAlt: "AccreditMX accreditation platform",
    theme: "navy",
    href: routes.solutions,
  },
];

export const servicesSection = { title: "Services" };

export const services: Service[] = [
  {
    name: "Design",
    description: "Interfaces that make complex systems feel simple.",
    image: designImg,
  },
  {
    name: "Development",
    description: "Web platforms and enterprise systems built from scratch.",
    image: developmentImg,
  },
  {
    name: "Mobile",
    description: "Native-quality apps for field teams and customers.",
    image: mobileImg,
  },
  {
    name: "AI",
    description: "Prediction, recommendation and plain-language answers.",
    image: aiImg,
  },
  {
    name: "Cloud",
    description: "Infrastructure that holds at national scale.",
    image: cloudImg,
  },
  {
    name: "Cybersecurity",
    description: "Protection built in from day one.",
    image: cyberImg,
  },
];

export const clientsSection = {
  moreLink: { label: "and over a hundred organisations since 2008", href: "#" },
  partnersLabel: "Certified partners",
};

export const clients: ClientLogo[] = [
  { name: "Ministry of Foreign Affairs", logo: mofa },
  { name: "Saudi Arabia Railways", logo: sar },
  { name: "Riyadh Season", logo: riyadhSeason },
  { name: "Toyota", logo: toyota },
  { name: "KAFD", logo: kafd },
  { name: "Sela", logo: sela },
  { name: "Amreyah Cement", logo: amreyah },
  { name: "Jeddah Events", logo: jeddahEvents },
  { name: "Ittihad Club", logo: ittihad },
  { name: "Abdul Rahman Al-Shareef Group", logo: aag },
  { name: "BLVD World", logo: blvdWorld },
  { name: "Al Taawoun FC", logo: altaawoun },
];

export const workSection = {
  intro: {
    before: "Our",
    after: "work",
    image: ourWorkImg,
    imageAlt: "Spark platforms",
  },
  title: "Selected work",
  cta: { label: "Show all work", href: routes.work },
};

export const projects: Project[] = [
  {
    title: "TicketMX",
    subtitle: "National-scale ticketing platform",
    tags: ["Ticketing", "Events"],
    metric: { value: "40M", label: "tickets sold" },
    image: ticketmxImg,
    href: "#",
  },
  {
    title: "Ministry of Foreign Affairs",
    subtitle: "Official governmental website",
    subtitleTbc: true,
    tags: ["Governmental"],
    metric: { value: "2,000–3,000", label: "daily active users" },
    image: mfaImg,
    href: "#",
  },
  {
    title: "Ma3ak Application El Moasser",
    subtitle: "Student LMS mobile application",
    tags: ["LMS", "Mobile app"],
    metric: { value: "10K–20K", label: "active students" },
    image: maakImg,
    href: "#",
  },
  {
    title: "Sela Super App",
    subtitle: "Mobile Application for internal Employees",
    subtitleTbc: true,
    tags: ["Employee app"],
    metric: { value: "+300", label: "requests daily" },
    image: selaWorkImg,
    href: "#",
  },
];

export const testimonialsSection = {
  eyebrow: "Testimonials",
  title: "In our clients' words",
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "I have been collaborating with Spark Systems since 2018 and I found them highly professional, reliable and flexible throughout our engagement.",
    author: "Faisal Nahar",
    company: "Sela",
    logo: sela,
  },
  {
    quote:
      "We have been very happy working with Spark Systems in a business relationship of more than ten years.",
    author: "Munzer Alkurdi",
    company: "Spine Creative Backbone",
  },
];

export const aiSection = {
  title: "Smarting your Business with AI",
  lead: "Intelligence isn't a feature we add. It's how everything we build behaves.",
};

export const aiCapabilities: AiCapability[] = [
  {
    title: "Predicts",
    description:
      "Your distribution system flags the stock-out three days before it happens.",
  },
  {
    title: "Decides",
    description:
      "Your event platform sees which gates are about to jam and redirects people before the queue forms.",
  },
  {
    title: "Answers",
    description:
      "An employee asks your HR portal a policy question in their own words, and gets the answer instantly, no ticket needed.",
  },
];

export const footerContent = {
  slogan: "Let wow begin.",
  blurb:
    "High-performance digital craftsmanship engineering custom software, enterprise platforms, and mobile solutions across the Middle East.",
};
