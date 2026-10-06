import { ScrollFillText } from "@/components/blocks/scroll-fill-text";
import { StatGrid } from "@/components/blocks/stat-grid";
import type { AboutPageData } from "@/types/about";

/** Company statement that fills in on scroll, followed by the headline figures. */
export function AboutIntro({ statement, stats }: AboutPageData["intro"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <ScrollFillText
        text={statement}
        className="m-0 mb-[clamp(40px,4.5cqw,72px)] max-w-[34ch] text-pretty text-[clamp(24px,2.4cqw,38px)] font-medium leading-[1.25] tracking-[-0.025em]"
      />
      <StatGrid stats={stats} />
    </section>
  );
}
