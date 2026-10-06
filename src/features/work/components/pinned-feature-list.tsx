"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/blocks/section-heading";
import { useMotion } from "@/components/providers/motion-provider";
import { Reveal } from "@/components/ui/reveal";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/types/work";

type PinnedFeatureListProps = ProjectDetail["features"];

/** Scroll (in viewport heights) given to each feature while pinned. */
const SCROLL_PER_FEATURE = 65;
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Key features (light section). On desktop the section pins: scrolling walks
 * through the features one by one; each has a thin bar that fills as you move
 * through it, and the screen beside the list crossfades to match. On mobile
 * each feature simply stacks with its screen.
 */
export function PinnedFeatureList(props: PinnedFeatureListProps) {
  const { isMobile } = useViewport();
  return isMobile ? <StackedFeatures {...props} /> : <PinnedFeatures {...props} />;
}

function PinnedFeatures({ eyebrow, title, items }: PinnedFeatureListProps) {
  const motion = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastP = useRef(-1);
  const [active, setActive] = useState(0);
  const n = items.length;

  useFrame(() => {
    const section = sectionRef.current;
    if (!section) return;
    const span = Math.max(1, section.offsetHeight - innerHeight);
    const p = clamp(-section.getBoundingClientRect().top / span, 0, 0.9999);
    if (p === lastP.current) return;
    lastP.current = p;
    const a = Math.floor(p * n);
    const within = p * n - a;
    barRefs.current.forEach((bar, k) => {
      if (bar) bar.style.transform = `scaleY(${(k < a ? 1 : k === a ? within : 0).toFixed(3)})`;
    });
    if (a !== active) setActive(a);
  });

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper text-ink"
      style={{ height: `calc(100vh + ${n * SCROLL_PER_FEATURE}vh)` }}
    >
      <div className="px-gutter sticky top-0 box-border grid h-screen grid-cols-2 items-center gap-[clamp(32px,5cqw,96px)] overflow-hidden pb-[min(40px,4vh)] pt-[max(76px,9vh)]">
        <div className="flex flex-col gap-[clamp(16px,3.5vh,44px)]">
          <SectionHeading eyebrow={eyebrow} title={title} tone="light" size="xl" maxWidth="12ch" />
          <ol className="m-0 flex list-none flex-col gap-[clamp(8px,1.6vh,26px)] p-0">
            {items.map((item, i) => (
              <li
                key={item.title}
                className={cn(
                  "relative flex flex-col gap-1.5 pl-6 transition-opacity duration-500 ease-spark",
                  i !== active && "opacity-32",
                )}
              >
                <span className="absolute inset-y-0 left-0 w-0.5 bg-ink/12">
                  <span
                    ref={(el) => void (barRefs.current[i] = el)}
                    className="absolute inset-0 origin-top bg-brand"
                    style={{ transform: motion ? "scaleY(0)" : "none" }}
                  />
                </span>
                <span className="flex items-baseline gap-3.5 text-[clamp(18px,min(1.8cqw,3.6vh),26px)] font-medium tracking-[-0.02em]">
                  <span className="font-mono text-[13px] text-brand">{pad2(i + 1)}</span>
                  {item.title}
                </span>
                <p className="m-0 max-w-[40ch] text-pretty text-[clamp(14px,min(1.15cqw,2.6vh),17px)] leading-[1.45] text-ink-700">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative h-[min(64vh,640px)] overflow-hidden rounded-card bg-[#E7E5E1]">
          {items.map((item, i) => (
            <div
              key={item.title}
              aria-hidden={i !== active}
              className={cn(
                "absolute inset-0 transition-[opacity,scale] duration-[900ms,1200ms] ease-[cubic-bezier(.45,0,.2,1)]",
                i === active ? "z-1 scale-100 opacity-100" : cn("opacity-0", motion && "scale-104"),
              )}
            >
              <Image src={item.image.src} alt={item.image.alt} fill sizes="50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackedFeatures({ eyebrow, title, items }: PinnedFeatureListProps) {
  return (
    <section className="px-gutter bg-paper py-[clamp(64px,12vw,96px)] text-ink">
      <SectionHeading eyebrow={eyebrow} title={title} tone="light" size="xl" maxWidth="12ch" className="mb-12" />
      <ol className="m-0 flex list-none flex-col gap-12 p-0">
        {items.map((item, i) => (
          <Reveal as="li" key={item.title} className="flex flex-col gap-4">
            <div className="relative aspect-4/3 overflow-hidden rounded-card bg-[#E7E5E1]">
              <Image src={item.image.src} alt={item.image.alt} fill sizes="100vw" className="object-cover" />
            </div>
            <span className="flex items-baseline gap-3.5 text-[22px] font-medium tracking-[-0.02em]">
              <span className="font-mono text-[13px] text-brand">{pad2(i + 1)}</span>
              {item.title}
            </span>
            <p className="m-0 text-[16px] leading-[1.45] text-ink-700">{item.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
