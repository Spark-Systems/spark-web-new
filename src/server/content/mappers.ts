import "server-only";

import type { WithId } from "@/server/db/collection";
import type { PartnerCard } from "@/types/about";
import type { Office, SocialLink } from "@/types/contact";
import type { ClientLogo, Partner } from "@/types/content";
import type { ContactContent } from "@/types/content";
import type {
  LogoRecord,
  OfferingContent,
  OfficeRecord,
  ProjectRecord,
  ServiceRecord,
  SocialLinks,
  SolutionRecord,
} from "@/types/cms";
import type { OfferingDetail } from "@/types/offering";
import type { ServiceArea } from "@/types/services";
import type { FlagshipSolution, SolutionSummary } from "@/types/solutions";
import type { ProjectSummary } from "@/types/work";

/** Stored records → the website's types. */

const hasPage = (r: { has_detail: boolean; detail: unknown }) => r.has_detail && r.detail !== null;

export const toSolutionSummary = (s: SolutionRecord): SolutionSummary => ({
  slug: s.slug,
  name: s.name,
  image: { src: s.image, alt: s.name },
  hasDetail: hasPage(s),
});

export const toFlagship = (s: SolutionRecord): FlagshipSolution => ({
  ...toSolutionSummary(s),
  icon: s.icon,
  description: s.description,
  tags: s.tags,
});

export const toServiceArea = (s: ServiceRecord): ServiceArea => ({
  slug: s.slug,
  name: s.name,
  icon: s.icon,
  image: { src: s.image, alt: s.name },
  summary: s.summary,
  description: s.description,
  capabilities: s.capabilities,
  hasDetail: hasPage(s),
});

export const toProjectSummary = (p: ProjectRecord): ProjectSummary => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  summary: p.summary,
  image: { src: p.image, alt: p.name },
  hasDetail: hasPage(p),
});

export const toOfferingDetail = (
  record: { slug: string; name: string; detail: OfferingContent | null },
  contact: ContactContent,
): OfferingDetail | null =>
  record.detail && {
    slug: record.slug,
    seo: record.detail.seo,
    hero: record.detail.hero,
    overview: { name: record.name, ...record.detail.overview },
    features: record.detail.features,
    process: record.detail.process,
    inUse: record.detail.inUse,
    contact,
  };

export const toClientLogo = (c: LogoRecord): ClientLogo => ({ name: c.name, logo: c.logo });

export const toPartner = (p: LogoRecord): Partner => ({
  name: p.name,
  logo: p.logo,
  showName: p.show_name,
  invert: p.invert,
});

export const toPartnerCard = (p: LogoRecord, label: string): PartnerCard => ({
  name: p.name,
  label,
  logo: { src: p.logo, alt: p.name },
  invert: p.invert,
});

export const toOffice = (o: WithId<OfficeRecord>): Office => ({
  id: o.id,
  city: o.city,
  country: o.country,
  hq: o.hq,
  timeZone: o.time_zone,
  address: o.address,
  mapUrl: o.map_url,
  lines: o.lines,
});

const socialLabels: Record<keyof SocialLinks, { label: string; icon: SocialLink["icon"] }> = {
  linkedin: { label: "LinkedIn", icon: "linkedin" },
  instagram: { label: "Instagram", icon: "instagram" },
  x: { label: "X", icon: "x" },
  facebook: { label: "Facebook", icon: "facebook" },
  youtube: { label: "YouTube", icon: "youtube" },
};

/** The social accounts with a URL, in a fixed order. */
export const toSocialLinks = (social: SocialLinks): SocialLink[] =>
  (Object.keys(socialLabels) as (keyof SocialLinks)[])
    .filter((platform) => social[platform]?.url)
    .map((platform) => ({ ...socialLabels[platform], href: social[platform].url }));
