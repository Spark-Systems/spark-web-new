"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";
import type { NextProject } from "@/types/work";

/** Panel offset (vh) from the top before / after it rises. */
const START = 58;
const END = 22;
/** Share of the pinned scroll over which the panel rises. */
const RISE = 0.6;
/** Circumference of the progress ring (r = 48 in a 100×100 viewBox). */
const RING = 301.6;
const EASE = "cubic-bezier(.76,0,.24,1)";

/**
 * End-of-case-study "Next" panel. While pinned, the next project's image
 * rises from below and a ring fills around "Scroll"; when the ring completes
 * the panel takes over the screen and the next project opens.
 */
export function NextProjectPanel({ next }: { next: NextProject }) {
  const motion = useMotion();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const leaving = useRef(false);

  const leave = () => {
    if (leaving.current) return;
    leaving.current = true;
    const panel = panelRef.current;
    if (!motion || !panel) return router.push(next.href);
    const t = `.9s ${EASE}`;
    panel.style.transition = `transform ${t}`;
    panel.style.transform = "translate3d(0,0,0)";
    if (imageRef.current) {
      imageRef.current.style.transition = `transform ${t}`;
      imageRef.current.style.transform = "scale(1)";
    }
    if (shadeRef.current) {
      shadeRef.current.style.transition = `opacity ${t}`;
      shadeRef.current.style.opacity = "0.25";
    }
    [copyRef.current, cueRef.current].forEach((el) => {
      if (!el) return;
      // `transform` (not `translate`) so the cue keeps its centring utilities.
      el.style.transition = `opacity .4s ease, transform .6s ${EASE}`;
      el.style.opacity = "0";
      el.style.transform = "translate3d(0,-30px,0)";
    });
    setTimeout(() => router.push(next.href), 950);
  };

  useFrame(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel || leaving.current) return;
    const p = clamp(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - innerHeight));
    const k = Math.min(1, p / RISE);
    const eased = 1 - Math.pow(1 - k, 3);
    const top = START - eased * (START - END);
    panel.style.transform = `translate3d(0,${top.toFixed(2)}vh,0)`;
    if (copyRef.current) copyRef.current.style.height = `${(100 - top).toFixed(2)}vh`;
    ringRef.current?.setAttribute("stroke-dashoffset", (RING * (1 - p)).toFixed(2));
    if (motion && imageRef.current) imageRef.current.style.transform = `scale(${(1.15 - 0.15 * eased).toFixed(4)})`;
    if (p >= 0.995) leave();
  });

  return (
    <section ref={sectionRef} className="bg-texture relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <a
          ref={panelRef}
          href={next.href}
          onClick={(e) => {
            e.preventDefault();
            leave();
          }}
          className="absolute inset-0 block text-snow will-change-transform hover:text-snow"
          style={{ transform: `translate3d(0,${START}vh,0)` }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div ref={imageRef} className="absolute inset-0 scale-[1.15] will-change-transform">
              <Image src={next.image.src} alt="" fill sizes="100vw" className="object-cover" />
            </div>
            <div ref={shadeRef} aria-hidden="true" className="absolute inset-0 bg-black opacity-55" />
          </div>

          {/* "Scroll" cue whose ring fills as you approach the next project. */}
          <span
            ref={cueRef}
            className="absolute left-1/2 top-0 -mt-3 flex size-[clamp(96px,8cqw,116px)] -translate-x-1/2 -translate-y-full items-center justify-center"
          >
            <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(242,242,240,0.28)" strokeWidth="1" />
              <circle
                ref={ringRef}
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="#F2F2F0"
                strokeWidth="1.6"
                strokeDasharray={RING}
                strokeDashoffset={RING}
              />
            </svg>
            <span className="text-sm font-medium">Scroll</span>
          </span>

          <div
            ref={copyRef}
            className="absolute inset-x-0 top-0 flex h-[42vh] flex-col items-center justify-center gap-[clamp(14px,2.4vh,24px)] px-6 text-center"
          >
            <span className="flex h-8 items-center rounded-full border border-snow px-3.5 text-[15px] font-medium">Next</span>
            <span className="text-[clamp(52px,7.5cqw,128px)] font-medium leading-[0.95] tracking-[-0.045em]">{next.name}</span>
            <span className="text-[clamp(16px,1.5cqw,22px)] text-fog-100">{next.category}</span>
          </div>
        </a>
      </div>
    </section>
  );
}
