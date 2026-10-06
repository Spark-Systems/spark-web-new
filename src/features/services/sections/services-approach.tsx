import { SectionHeading } from "@/components/blocks/section-heading";
import { TimelineSteps } from "@/components/blocks/timeline-steps";
import { Reveal } from "@/components/ui/reveal";
import type { ServicesPageData } from "@/types/services";

/** "How we work": heading pinned on the left, the project stages down a filling timeline on the right. */
export function ServicesApproach({ eyebrow, title, lead, steps }: ServicesPageData["approach"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(40px,6cqw,112px)]">
        <div className="flex flex-col gap-5 md:sticky md:top-[120px]">
          <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="12ch" />
          <Reveal as="p" delay={160} className="m-0 max-w-[34ch] text-[clamp(16px,1.3cqw,19px)] leading-normal text-fog-400">
            {lead}
          </Reveal>
        </div>
        <TimelineSteps steps={steps} />
      </div>
    </section>
  );
}
