"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";
import type { NavLink, PageHeroContent } from "@/types/content";
import { Icon } from "@/components/ui/icon";
import { SmartLink } from "@/components/ui/smart-link";

/** How far each headline line drifts right as the hero scrolls away, in ems (by line index). */
const LINE_DRIFT = [0, 0.9, 1.8];
/** Scroll (in viewport heights) over which the drift plays out. */
const DRIFT_RANGE = 0.8;

/**
 * Full-screen hero for inner pages. The background image fades and settles in
 * on load and stays put while the page scrolls over it; the headline lines rise
 * out of their masks, then drift right in a staircase as the hero scrolls away.
 * An optional `back` link sits above the eyebrow (e.g. "Back to Work").
 */
export function PageHero({ eyebrow, titleLines, image, back }: PageHeroContent & { back?: NavLink }) {
  const motion = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const last = useRef({ scrolled: -1, width: 0, fontSize: 0 });

  useFrame(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const heading = headingRef.current;
    if (!section || !media || !heading) return;
    const scrolled = clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight);
    const l = last.current;
    if (scrolled === l.scrolled && innerWidth === l.width) return;
    l.scrolled = scrolled;
    if (innerWidth !== l.width) {
      l.width = innerWidth;
      l.fontSize = parseFloat(getComputedStyle(heading).fontSize) || 0;
    }

    // Counter the scroll so the image stays fixed until the hero has gone.
    media.style.transform = `translate3d(0,${scrolled.toFixed(1)}px,0)`;

    const p = clamp(scrolled / (innerHeight * DRIFT_RANGE));
    const eased = 1 - (1 - p) * (1 - p);
    lineRefs.current.forEach((line, i) => {
      const drift = LINE_DRIFT[Math.min(i, LINE_DRIFT.length - 1)];
      if (line) line.style.translate = `${(drift * eased * l.fontSize).toFixed(1)}px 0`;
    });
  }, motion);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="px-gutter relative z-0 box-border flex min-h-[max(480px,100vh)] flex-col justify-end gap-[clamp(18px,3vh,44px)] overflow-hidden bg-black pb-[clamp(28px,5vh,72px)] pt-[calc(84px+clamp(40px,6vh,96px))]"
    >
      <div ref={mediaRef} aria-hidden="true" className="absolute inset-x-0 top-0 h-full will-change-transform">
        <div className="page-hero-media absolute inset-0">
          <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="page-hero-fade absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_25%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.85)_85%,#000_100%)]" />
      </div>

      {back && (
        <Reveal as="div" className="relative self-start">
          <SmartLink
            href={back.href}
            className="flex min-h-[42px] items-center gap-2 rounded-full border border-brand bg-black/25 pl-3.5 pr-5 text-sm font-medium text-snow backdrop-blur-sm transition-colors hover:bg-brand hover:text-white"
          >
            <Icon name="arrow-left" size={16} />
            {back.label}
          </SmartLink>
        </Reveal>
      )}
      <Reveal as="div" className="relative">
        <Eyebrow className="text-brand-bright">{eyebrow}</Eyebrow>
      </Reveal>
      <h1
        ref={headingRef}
        aria-label={titleLines.join(" ")}
        className="page-hero-fade relative m-0 text-[clamp(40px,min(7cqw,10vh),116px)] font-medium leading-[0.98] tracking-[-0.045em]"
        style={{ "--fade-delay": "450ms" } as CSSProperties}
      >
        {titleLines.map((line, i) => (
          // Each line rises out of its own mask on load (see .hero-line).
          <span key={i} aria-hidden="true" className="mb-[-0.06em] block overflow-hidden pb-[0.06em]">
            <span
              ref={(el) => void (lineRefs.current[i] = el)}
              className="hero-line block whitespace-nowrap will-change-transform"
              style={{ "--line": i, "--line-start": "650ms" } as CSSProperties}
            >
              {line}
            </span>
          </span>
        ))}
      </h1>
    </section>
  );
}
