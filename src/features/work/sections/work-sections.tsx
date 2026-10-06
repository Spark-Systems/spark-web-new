import { StatCounter } from "@/components/blocks/stat-counter";
import { Icon } from "@/components/ui/icon";
import { PillLink } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { routes } from "@/config/site";
import type { WorkPageData } from "@/types/work";
import { PortfolioGrid } from "../components/portfolio-grid";

/** "Selected work": the filterable project grid. Anchored at `#portfolio`. */
export function WorkPortfolio(props: WorkPageData["portfolio"]) {
  return (
    <section id="portfolio" className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <PortfolioGrid {...props} />
    </section>
  );
}

/** Light feature block for one case study: pitch and link on the left, headline figures on the right. */
export function FeaturedCase({ eyebrow, slug, name, summary, ctaLabel, stats }: WorkPageData["featured"]) {
  return (
    <section className="bg-paper px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-[clamp(40px,6cqw,112px)]">
        <Reveal className="flex flex-col gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="m-0 text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">{name}</h2>
          <p className="m-0 max-w-[34ch] text-[clamp(18px,1.5cqw,22px)] leading-normal text-ink-700">{summary}</p>
          <PillLink href={routes.project(slug)} variant="onLight" className="self-start">
            {ctaLabel} <Icon name="arrow-right" />
          </PillLink>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-[clamp(20px,3cqw,48px)] gap-y-[clamp(28px,3cqw,48px)]">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="border-t border-ink/14 pt-5">
              <StatCounter {...stat} size="lg" tone="light" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
