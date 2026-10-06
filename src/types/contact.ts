import type { IconName, NavLink, PageHeroContent, PageSeo } from "./content";

/** One way to reach an office ("Tel", "Mobile", "Email"). */
export interface ContactLine {
  /** Kind of contact; picks the line's icon. */
  type: "phone" | "mobile" | "email";
  label: string;
  value: string;
  /** `tel:` / `mailto:` link. */
  href: string;
}

/** A Spark office: where it is, its local time zone, and how to reach it. */
export interface Office {
  id: string;
  city: string;
  country: string;
  /** Headquarters are marked "HQ". */
  hq?: boolean;
  /** IANA time zone for the live local clock, e.g. "Africa/Cairo". */
  timeZone: string;
  /** Street address; also what the embedded map searches for. */
  address: string;
  /** Link that opens the office in Google Maps. */
  mapUrl: string;
  lines: ContactLine[];
}

export interface SocialLink extends NavLink {
  icon: IconName;
}

/** One sentence-style form field: "Hi Spark, my name is ___". */
export interface FormPrompt {
  prompt: string;
  placeholder: string;
}

/** Copy for the conversational enquiry form. */
export interface EnquiryFormCopy {
  name: FormPrompt;
  company: FormPrompt;
  email: FormPrompt;
  message: FormPrompt;
  submitLabel: string;
  successMessage: string;
  resetLabel: string;
}

/** Everything the contact page renders; mirrors the future `GET /pages/contact` response. */
export interface ContactPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  offices: { eyebrow: string; items: Office[] };
  enquiry: {
    eyebrow: string;
    lead: string;
    emailPrompt: string;
    email: string;
    socials: SocialLink[];
    form: EnquiryFormCopy;
  };
}
