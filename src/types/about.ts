import type {
  ClientLogo,
  ContactContent,
  IconName,
  ImageAsset,
  PageHeroContent,
  PageSeo,
  SectionIntro,
  Stat,
} from "./content";

/** A point on the "Our story" timeline. */
export interface Milestone {
  /** Display year; may be a placeholder like "20XX" while unconfirmed. */
  year: string;
  title: string;
  body: string;
  icon: IconName;
  /** Marks a year still awaiting client confirmation. */
  tbc?: boolean;
}

export interface CompanyValue {
  title: string;
  body: string;
}

interface MvvStepBase {
  id: string;
  /** Short label in the step list ("Mission"). */
  label: string;
  /** Kicker above the step's copy ("Our mission"). */
  eyebrow: string;
  image: ImageAsset;
}

/** One step of the mission / vision / values scene: either a statement or a list of values. */
export type MvvStep =
  | (MvvStepBase & { kind: "statement"; text: string })
  | (MvvStepBase & { kind: "values"; values: CompanyValue[] });

export interface PartnerCard {
  name: string;
  /** Small caption under the name ("Partner"). */
  label: string;
  logo: ImageAsset;
  /** Render the logo as monochrome white (for dark-on-transparent marks). */
  invert?: boolean;
}

/** Everything the About page renders; mirrors the future `GET /pages/about` response. */
export interface AboutPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  intro: {
    /** Statement that fills in word by word as it scrolls into view. */
    statement: string;
    stats: Stat[];
  };
  mvv: {
    title: string;
    steps: MvvStep[];
  };
  story: SectionIntro & { milestones: Milestone[] };
  clients: SectionIntro & { logos: ClientLogo[] };
  partnerships: SectionIntro & { partners: [PartnerCard, PartnerCard] };
  contact: ContactContent;
}
