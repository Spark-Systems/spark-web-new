import { PageHero } from "@/components/blocks/page-hero";
import { ContactSection } from "@/features/contact";
import type { NavLink } from "@/types/content";
import type { OfferingDetail } from "@/types/offering";
import { OfferingFeatures } from "./sections/offering-features";
import { OfferingInUse } from "./sections/offering-in-use";
import { OfferingOverview } from "./sections/offering-overview";
import { OfferingProcess } from "./sections/offering-process";

/** The full solution / service detail page: hero, overview, features, process, where it's used, contact. */
export function OfferingDetailPage({ detail, back }: { detail: OfferingDetail; back: NavLink }) {
  return (
    <>
      <PageHero {...detail.hero} />
      <OfferingOverview {...detail.overview} back={back} />
      <OfferingFeatures {...detail.features} />
      <OfferingProcess {...detail.process} />
      <OfferingInUse {...detail.inUse} />
      <ContactSection content={detail.contact} />
    </>
  );
}
