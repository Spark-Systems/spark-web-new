import { Reveal } from "@/components/ui/reveal";
import { hero } from "@/content/home";
import { HeroBackground } from "../components/hero-background";
// import { RotatingWord } from "../components/rotating-word";
import { StatCounter } from "../components/stat-counter";

export function HeroSection() {
  return (
    <section
      id="top"
      className="px-gutter relative overflow-hidden"
    >
      <HeroBackground videoSrc={hero.videoSrc} />

      {/* Screen 1: heading, vertically centred, left-aligned. */}
      <div className="relative flex min-h-[max(600px,100vh)] flex-col items-start justify-center py-[clamp(120px,14cqw,220px)]">
        <Reveal
          as="h1"
          className="m-0 max-w-[14ch] text-balance text-[clamp(46px,7.6cqw,124px)] font-medium leading-[0.98] tracking-[-0.045em]"
        >
          {hero.titleStart}
          {/* Zero-size anchor: the rotating label hangs off the end of the first line. */}
          {/* <span aria-hidden="true" className="relative inline-block size-0">
            <span className="absolute bottom-[0.6em] left-[0.3em] flex translate-y-1/2 items-center gap-2 whitespace-nowrap font-mono text-[clamp(16px,1.7cqw,26px)] font-normal leading-none tracking-normal text-brand-bright">
              <RotatingWord words={hero.rotatingWords} />
            </span>
          </span>{" "} */}
          <br />
          {hero.titleEnd}
        </Reveal>
      </div>

      {/* Screen 2: paragraphs + stats, vertically centred, left-aligned. */}
      <div className="relative flex min-h-[max(600px,100vh)] flex-col justify-center gap-[clamp(48px,7cqw,112px)] py-[clamp(80px,10cqw,160px)]">
        <div className="grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(20px,4cqw,72px)]">
          {hero.paragraphs.map((text, i) => (
            <Reveal
              as="p"
              key={i}
              delay={i * 160}
              className="m-0 text-pretty text-[clamp(18px,1.55cqw,23px)] leading-normal text-fog-100"
            >
              {text}
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={240}
          className="grid grid-cols-3 gap-[clamp(12px,3cqw,48px)] border-t border-white/14 pt-[clamp(20px,2.4cqw,36px)]"
        >
          {hero.stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
