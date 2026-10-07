import type { CSSProperties } from "react";
import type { HomeHero } from "@/types/home";
import { HeroBackground } from "../components/hero-background";

/** The opening screen: the headline over the video. The intro and figures follow in HeroIntroSection. */
export function HeroSection(hero: Pick<HomeHero, "titleStart" | "titleEnd" | "videoSrc">) {
  /** Headline lines: the first part breaks per word, the ending stays on one line. */
  const headlineLines = [...hero.titleStart.split(" "), hero.titleEnd];

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

    </section>
  );
}
