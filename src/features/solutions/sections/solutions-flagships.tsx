import { ParallaxImage } from "@/components/blocks/parallax-image";
import { SectionHeading } from "@/components/blocks/section-heading";
import { StackCard, StackCards } from "@/components/blocks/stack-cards";
import { Icon } from "@/components/ui/icon";
import { PillLink } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";
import { TagPills } from "@/components/ui/tag-pills";
import { solutionHref } from "@/lib/links";
import type { SolutionsPageData } from "@/types/solutions";

const pad = (n: number) => String(n).padStart(2, "0");

/** Flagship platforms as large cards that stack on top of each other as the page scrolls. */
export function SolutionsFlagships({ eyebrow, title, lead, items }: SolutionsPageData["flagships"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <div className="mb-[clamp(40px,5cqw,72px)] flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="14ch" />
        <Reveal as="p" delay={160} className="m-0 max-w-[34ch] text-[clamp(16px,1.3cqw,19px)] leading-normal text-fog-400">
          {lead}
        </Reveal>
      </div>

      <StackCards>
        {items.map((item, i) => (
          <StackCard key={item.slug}>
            <article data-cursor="hover" className="flex h-full origin-top flex-wrap overflow-hidden rounded-card border border-white/8 bg-surface will-change-transform">
              <div className="box-border flex flex-[1_1_360px] flex-col justify-between gap-6 p-[clamp(28px,3.5cqw,56px)]">
                <div className="flex items-center justify-between text-fog-600">
                  <span className="font-mono text-[13px]">
                    {pad(i + 1)} / {pad(items.length)}
                  </span>
                  <Icon name={item.icon} size={28} className="text-brand-bright" />
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 text-[clamp(32px,3.6cqw,56px)] font-medium leading-none tracking-[-0.035em]">
                    {item.name}
                  </h3>
                  <p className="m-0 max-w-[34ch] text-[clamp(16px,1.3cqw,19px)] leading-normal text-fog-400">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.hasDetail && (
                    <PillLink href={solutionHref(item)} className="h-9 px-4 text-[13px]">
                      Explore <Icon name="arrow-right" />
                    </PillLink>
                  )}
                  <TagPills tags={item.tags} />
                </div>
              </div>
              <div className="relative min-h-[220px] flex-[1.4_1_420px] overflow-hidden">
                <ParallaxImage image={item.image} strength={50} sizes="(min-width: 760px) 60vw, 100vw" />
              </div>
            </article>
          </StackCard>
        ))}
      </StackCards>
    </section>
  );
}
