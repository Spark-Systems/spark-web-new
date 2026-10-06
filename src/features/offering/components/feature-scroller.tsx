"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/blocks/section-heading";
import { useMotion } from "@/components/providers/motion-provider";
import { Icon } from "@/components/ui/icon";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";
import type { OfferingDetail } from "@/types/offering";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Features list beside a pinned image. Whichever feature sits nearest the
 * middle of the screen is active: it brightens while the others dim, and the
 * image (with its "01 / 06" counter) crossfades to match.
 */
export function FeatureScroller({ eyebrow, title, items }: OfferingDetail["features"]) {
  const motion = useMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useFrame(() => {
    const list = listRef.current;
    if (!list) return;
    const mid = innerHeight / 2;
    let best = 0;
    let bestDistance = Infinity;
    list.querySelectorAll<HTMLElement>("[data-feature]").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    if (best !== active) setActive(best);
  });

  return (
    <div className="grid items-start gap-[clamp(32px,5cqw,112px)] md:grid-cols-2">
      <div className="z-1 md:sticky md:top-[clamp(88px,12vh,120px)]">
        <div className="relative aspect-4/5 max-h-[72vh] w-full overflow-hidden rounded-card bg-surface">
          {items.map((item, i) => (
            <div
              key={item.title}
              aria-hidden={i !== active}
              className={cn(
                "absolute inset-0 transition-[opacity,scale] duration-[800ms,1200ms] ease-spark",
                i === active ? "scale-100 opacity-100" : cn("opacity-0", motion && "scale-106"),
              )}
            >
              <Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 760px) 45vw, 100vw" className="object-cover" />
            </div>
          ))}
          <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-full bg-black/55 px-3.5 py-2 font-mono text-[13px] text-snow backdrop-blur-sm">
            <span>{pad(active + 1)}</span>
            <span className="text-fog-600">/ {pad(items.length)}</span>
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex flex-col">
        <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="12ch" className="pb-[clamp(24px,4vh,48px)]" />
        {items.map((item, i) => (
          <div
            key={item.title}
            data-feature=""
            className={cn(
              "flex min-h-[min(56vh,520px)] flex-col justify-center gap-4 border-t border-white/10 transition-opacity duration-[600ms]",
              motion && i !== active && "opacity-30",
            )}
          >
            <div className="flex items-center gap-3.5">
              <Icon name={item.icon} size={30} className="text-brand-bright" />
              <span className="font-mono text-[13px] text-fog-600">{pad(i + 1)}</span>
            </div>
            <h3 className="m-0 text-[clamp(28px,2.8cqw,44px)] font-medium leading-[1.05] tracking-[-0.03em]">{item.title}</h3>
            <p className="m-0 max-w-[36ch] text-[clamp(16px,1.3cqw,19px)] leading-normal text-fog-400">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
