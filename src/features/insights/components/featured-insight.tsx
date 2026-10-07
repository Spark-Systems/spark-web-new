import { ParallaxImage } from "@/components/blocks/parallax-image";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/ui/smart-link";
import { Eyebrow, MonoLabel } from "@/components/ui/typography";
import type { InsightsPageData } from "@/types/insights";
import { formatInsightDate, insightHref } from "../format";

/** The highlighted article: a drifting picture beside its title, summary and link. */
export function FeaturedInsight({ featured }: { featured: NonNullable<InsightsPageData["featured"]> }) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)] text-snow">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(32px,5cqw,88px)]">
        <Reveal className="relative aspect-[5/4] overflow-hidden rounded-card bg-[#141416]">
          <ParallaxImage image={featured.image} sizes="(min-width: 900px) 50vw, 100vw" />
        </Reveal>
        <Reveal delay={120} className="flex flex-col gap-[22px]">
          <div className="flex items-center gap-4">
            <Eyebrow className="text-brand-bright">{featured.eyebrow}</Eyebrow>
            <MonoLabel className="text-[13px] text-fog-500">{formatInsightDate(featured.date)}</MonoLabel>
          </div>
          <h2 className="m-0 max-w-[16ch] text-balance text-[clamp(36px,4cqw,64px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {featured.title}
          </h2>
          {featured.summary && (
            <p className="m-0 max-w-[38ch] text-[clamp(17px,1.4cqw,20px)] leading-normal text-fog-400">{featured.summary}</p>
          )}
          <SmartLink
            href={insightHref(featured.slug)}
            className="flex min-h-[42px] items-center gap-2 self-start rounded-full border border-brand px-5 text-sm font-medium text-snow transition-colors hover:bg-brand hover:text-white"
          >
            {featured.ctaLabel}
            <Icon name="arrow-right" size={16} />
          </SmartLink>
        </Reveal>
      </div>
    </section>
  );
}
