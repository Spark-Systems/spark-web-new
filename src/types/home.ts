import type { StaticImageData } from "next/image";
import type {
  AiCapability,
  ClientLogo,
  ContactContent,
  NavLink,
  Partner,
  Project,
  Service,
  Solution,
  Stat,
  Testimonial,
} from "./content";

/** Opening screens: headline, intro paragraphs and headline figures over the video. */
export interface HomeHero {
  titleStart: string;
  titleEnd: string;
  videoSrc: string;
  paragraphs: string[];
  stats: Stat[];
}

export interface HomeSolutionsSection {
  title: string;
  /** Headline figure beside the title; `tbc` marks it as awaiting confirmation. */
  highlight: { value: string; label: string; tbc: string };
  cta: NavLink;
  items: Solution[];
}

export interface HomeServicesSection {
  title: string;
  items: Service[];
}

export interface HomeClientsSection {
  moreLink: NavLink;
  partnersLabel: string;
  /** Filled from the clients and partners lists. */
  clients: ClientLogo[];
  partners: Partner[];
}

export interface HomeWorkSection {
  intro: { before: string; after: string; image: StaticImageData; imageAlt: string };
  title: string;
  cta: NavLink;
  items: Project[];
}

export interface HomeTestimonialsSection {
  eyebrow: string;
  title: string;
  items: Testimonial[];
}

export interface HomeAiSection {
  title: string;
  lead: string;
  capabilities: AiCapability[];
}

/** Everything the home page renders; mirrors `GET /api/v1/pages/home`. */
export interface HomePageData {
  hero: HomeHero;
  solutions: HomeSolutionsSection;
  services: HomeServicesSection;
  clients: HomeClientsSection;
  work: HomeWorkSection;
  testimonials: HomeTestimonialsSection;
  ai: HomeAiSection;
  contact: ContactContent;
}
