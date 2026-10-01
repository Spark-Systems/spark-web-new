import type { StaticImageData } from "next/image";

export interface NavLink {
  label: string;
  href: string;
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
  /** Marks copy still awaiting client confirmation. */
  subtitleTbc?: boolean;
  tags: string[];
  metric: { value: string; label: string };
  image: StaticImageData;
  href: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  /** Omit while the job title is unconfirmed; renders a TBC marker. */
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
