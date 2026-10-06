import type { CSSProperties } from "react";
import { Reveal } from "@/components/ui/reveal";
import { hero } from "@/content/home";
import { cn } from "@/lib/utils";
import { HeroBackground } from "../components/hero-background";
import { StatCounter } from "@/components/blocks/stat-counter";

/** Headline lines: the first part breaks per word, the ending stays on one line. */
const headlineLines = [...hero.titleStart.split(" "), hero.titleEnd];

export function HeroSection() {
  return (
    <section id="top" className="px-gutter relative overflow-hidden">
      <HeroBackground videoSrc={hero.videoSrc} />

      {/* Screen 1: headline, vertically centred, left-aligned. */}
      <div className="relative flex min-h-[max(520px,100vh)] flex-col justify-center">
        <h1
          aria-label={`${hero.titleStart} ${hero.titleEnd}`}
          className="m-0 text-[clamp(50px,9.2cqw,156px)] font-medium leading-none tracking-[-0.035em]"
        >
          {headlineLines.map((line, i) => (
            // Each line rises out of its own mask on load (see .hero-line).
            <span
              key={i}
              aria-hidden="true"
              className="mb-[-0.08em] block overflow-hidden pb-[0.08em]"
            >
              <span
                className="hero-line block will-change-transform"
                style={{ "--line": i } as CSSProperties}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* Screen 2: paragraphs centred in the screen, counters along the bottom. */}
      <div className="relative grid min-h-screen grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-y-[clamp(48px,6cqw,88px)] py-[clamp(40px,5cqw,72px)]">
        <div className="row-start-2 flex max-w-245 flex-col gap-8">
          {hero.paragraphs.map((text, i) => (
            <Reveal
              as="p"
              key={i}
              delay={i * 150}
              className={cn(
                "m-0 text-pretty text-[clamp(22px,2.7cqw,40px)] font-normal leading-[1.28] tracking-[-0.012em]",
                i > 0 && "text-fog-300",
              )}
            >
              {text}
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={250}
          className="row-start-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-8 self-end"
        >
          {hero.stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
