"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import { Lightbox, type LightboxItem } from "./lightbox";

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * A pinned gallery that scrolls sideways: while the section is pinned, page
 * scroll moves the row of screens left, with a "01 — 04" counter and progress
 * bar. Clicking a screen opens it full size in a lightbox. Under reduced
 * motion the row simply scrolls horizontally.
 */
export function HorizontalGallery({ title, items }: { title: string; items: LightboxItem[] }) {
  const motion = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const lastP = useRef(-1);
  const [open, setOpen] = useState<number | null>(null);
  const n = items.length;

  useFrame(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;
    // The section is exactly as tall as the sideways travel, so a scroll pixel moves the row a pixel.
    const over = Math.max(0, track.scrollWidth - pin.clientWidth);
    const height = `${Math.round(innerHeight + over)}px`;
    if (section.style.height !== height) section.style.height = height;
    const p = over ? clamp(-section.getBoundingClientRect().top / over) : 0;
    if (p === lastP.current) return;
    lastP.current = p;
    track.style.transform = `translate3d(${(-p * over).toFixed(1)}px,0,0)`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    if (counterRef.current) counterRef.current.textContent = pad2(Math.min(n, 1 + Math.floor(p * n * 0.999)));
  }, motion);

  return (
    <section ref={sectionRef} className="relative bg-ink text-snow">
      <div
        ref={pinRef}
        className={cn(
          "box-border flex flex-col justify-center gap-[clamp(28px,5vh,56px)] overflow-hidden",
          motion ? "sticky top-0 h-screen pt-[76px]" : "py-24",
        )}
      >
        <div className="px-gutter flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 max-w-[12ch] text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {title}
          </h2>
          <div className="flex items-center gap-4 font-mono text-[13px] text-fog-600">
            <span ref={counterRef} className="text-snow">
              01
            </span>
            <span className="relative h-px w-[120px] overflow-hidden bg-white/15">
              <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-brand-bright" />
            </span>
            <span>{pad2(n)}</span>
          </div>
        </div>
        <div className={cn(!motion && "no-scrollbar overflow-x-auto")}>
          <div ref={trackRef} className="px-gutter flex w-max gap-[clamp(16px,2cqw,28px)] will-change-transform">
            {items.map((item, i) => (
              <figure key={i} className="m-0 flex flex-col gap-3.5">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  data-cursor="view"
                  aria-label={`View “${item.caption}” full size`}
                  className="relative h-[min(58vh,540px)] w-[min(820px,82vw)] cursor-zoom-in overflow-hidden rounded-card bg-surface"
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1000px) 820px, 82vw"
                    className="object-cover object-top transition-transform duration-700 ease-spark hover:scale-[1.03]"
                  />
                </button>
                <figcaption className="flex gap-3.5 text-[15px] text-fog-400">
                  <span className="font-mono text-[13px] text-brand-bright">{pad2(i + 1)}</span>
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
      <Lightbox items={items} index={open} onChange={setOpen} />
    </section>
  );
}
