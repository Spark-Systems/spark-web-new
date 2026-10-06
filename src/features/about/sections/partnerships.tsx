import { SectionHeading } from "@/components/blocks/section-heading";
import type { AboutPageData } from "@/types/about";
import { PartnershipConnect } from "../components/partnership-connect";

/** Centred heading over the two technology partners connecting to Spark. */
export function Partnerships({ eyebrow, title, partners }: AboutPageData["partnerships"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(72px,8cqw,128px)]">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        size="md"
        align="center"
        maxWidth="20ch"
        className="mb-[clamp(40px,5cqw,80px)]"
      />
      <PartnershipConnect partners={partners} />
    </section>
  );
}
