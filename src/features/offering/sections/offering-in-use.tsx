import { MediaLinkCard } from "@/components/blocks/media-link-card";
import { SectionHeading } from "@/components/blocks/section-heading";
import { StatCounter } from "@/components/blocks/stat-counter";
import { Reveal } from "@/components/ui/reveal";
import type { OfferingDetail } from "@/types/offering";

/** "In use": heading (with an optional headline figure beside it), then the projects and clients using it. */
export function OfferingInUse({ eyebrow, title, stat, cases }: OfferingDetail["inUse"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <div className="mb-[clamp(40px,5cqw,64px)] flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="14ch" />
        {stat && (
          <Reveal delay={160}>
            <StatCounter {...stat} size="lg" />
          </Reveal>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(16px,2cqw,28px)]">
        {cases.map((item, i) => (
          <Reveal key={item.name} delay={i * 100}>
            <MediaLinkCard title={item.name} image={item.image} href={item.href} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
