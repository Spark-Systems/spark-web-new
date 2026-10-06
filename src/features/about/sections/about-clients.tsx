import { SectionHeading } from "@/components/blocks/section-heading";
import type { AboutPageData } from "@/types/about";
import { ExpandableLogoWall } from "../components/expandable-logo-wall";

/** Heading pinned on the left while the client logo wall scrolls past on the right. */
export function AboutClients({ eyebrow, title, logos }: AboutPageData["clients"]) {
  return (
    <section className="bg-texture px-gutter pb-[clamp(56px,6cqw,96px)] pt-[clamp(96px,11cqw,176px)]">
      <div className="grid items-start gap-[clamp(32px,5cqw,96px)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
        <div className="md:sticky md:top-[clamp(96px,14vh,160px)]">
          <SectionHeading eyebrow={eyebrow} title={title} maxWidth="16ch" />
        </div>
        <ExpandableLogoWall logos={logos} />
      </div>
    </section>
  );
}
