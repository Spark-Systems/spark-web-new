import { Reveal } from "@/components/ui/reveal";
import { hero } from "@/content/home";
import { HeroBackground } from "../components/hero-background";
// import { RotatingWord } from "../components/rotating-word";
import { StatCounter } from "../components/stat-counter";

export function HeroSection() {
  return (
    <section
      id="top"
      className="px-gutter relative flex min-h-[max(760px,100vh)] flex-col justify-end overflow-hidden pb-[clamp(40px,5cqw,72px)] pt-[clamp(120px,14cqw,220px)]"
    >
      <HeroBackground videoSrc={hero.videoSrc} />

      <div className="relative flex flex-col gap-[clamp(48px,7cqw,112px)]">
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
