import type { StaticImageData } from "next/image";

/** A static import today; a URL string once content comes from the API (allow its host in next.config). */
export type ImageSource = StaticImageData | string;

/** An image plus its alt text. Components render it with `fill`, so no intrinsic size is needed. */
export interface ImageAsset {
  src: ImageSource;
  alt: string;
}

/** Icon keys content can reference by name; mapped to icon components in <Icon />. */
export type IconName =
  | "armchair"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up-right"
  | "arrows-left-right"
  | "bank"
  | "chart-bar"
  | "chart-line-up"
  | "cloud"
  | "code"
  | "cube"
  | "cursor-click"
  | "device-mobile"
  | "envelope"
  | "facebook"
  | "flag"
  | "flow-arrow"
  | "globe"
  | "handshake"
  | "identification-badge"
  | "identification-card"
  | "instagram"
  | "layout"
  | "linkedin"
  | "magnifying-glass"
  | "map-pin"
  | "map-trifold"
  | "paint-brush"
  | "pen-nib"
  | "phone"
  | "plugs-connected"
  | "qr-code"
  | "scan"
  | "shield-check"
  | "shopping-cart"
  | "sparkle"
  | "storefront"
  | "ticket"
  | "tree-structure"
  | "trophy"
  | "truck"
  | "x"
  | "x-close"
  | "youtube";

/** SEO fields every page provides. */
export interface PageSeo {
  title: string;
  description: string;
}

/** Eyebrow + heading pair that opens most sections. */
export interface SectionIntro {
  eyebrow: string;
  title: string;
}

/** Full-screen inner-page hero: eyebrow, a headline split into lines, and a background image. */
export interface PageHeroContent {
  eyebrow: string;
  titleLines: string[];
  image: ImageAsset;
}

/** One step of a numbered process ("Buy", "Receive", "Scan", …). */
export interface ProcessStep {
  icon: IconName;
  title: string;
  body: string;
}

/** Copy for the shared contact section. */
export interface ContactContent {
  title: string;
  lead: string;
  submitLabel: string;
}

export interface NavLink {
  label: string;
  href: string;
}

/** Full-screen menu entry as stored: a link and the brief shown while it is hovered. */
export interface MenuLink extends NavLink {
  brief: string;
}

/** Full-screen menu entry on the website: the preview picture is the linked page's hero image. */
export interface MenuItem extends MenuLink {
  image: ImageSource;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export type SolutionTheme = "brand" | "navy";

export interface Solution {
  id: string;
  title: string;
  /** Mono caption above the title, e.g. "01 — 40M tickets issued to date". */
  caption: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  theme: SolutionTheme;
  href: string;
}

export interface Service {
  name: string;
  description: string;
  image: StaticImageData;
}

export interface ClientLogo {
  name: string;
  logo: StaticImageData;
}

export interface Project {
  title: string;
  subtitle: string;
  tags: string[];
  metric: { value: string; label: string };
  image: StaticImageData;
  href: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  /** Job title; when omitted only the company is shown. */
  role?: string;
  company: string;
  logo?: StaticImageData;
}

export interface AiCapability {
  title: string;
  description: string;
}

export interface Partner {
  name: string;
  logo: StaticImageData;
  /** Render the name next to the mark (for logos that are only a symbol). */
  showName?: boolean;
  /** Force a monochrome white logo. */
  invert?: boolean;
}
