import { StatCounter } from "@/components/blocks/stat-counter";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { HomeHero } from "@/types/home";

/**
 * The block right under the hero: the intro paragraphs side by side (stacked
 * on mobile), then the headline figures.
 */
export function HeroIntroSection({ paragraphs, stats }: Pick<HomeHero, "paragraphs" | "stats">) {
  return (
    <section className="px-gutter py-[clamp(72px,9cqw,144px)]">
      <div className="grid gap-x-[clamp(32px,5cqw,96px)] gap-y-8 md:grid-cols-2">
        {paragraphs.map((text, i) => (
          <Reveal
            as="p"
            key={i}
            delay={i * 150}
            className={cn(
              "m-0 text-pretty text-[clamp(18px,1.9cqw,32px)] font-normal leading-[1.32] tracking-[-0.01em]",
              i > 0 && "text-fog-300",
            )}
          >
            {text}
          </Reveal>
        ))}
      </div>

      {stats.length > 0 && (
        <Reveal
          delay={250}
          className="mt-[clamp(56px,7cqw,112px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-8 border-t border-white/8 pt-[clamp(32px,4cqw,56px)]"
        >
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </Reveal>
      )}
    </section>
  );
}
