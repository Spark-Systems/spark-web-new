"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { cn } from "@/lib/utils";
import type { PartnerCard } from "@/types/about";

const EASE = "cubic-bezier(.2,.8,.2,1)";
/** How far (px) the partner cards travel in from the sides. */
const SLIDE = 220;
/** When the glow bursts behind the Spark mark, and when it fades again (ms after connecting). */
const GLOW_AT = 1600;
const GLOW_OUT_AT = 2100;

type Glow = "idle" | "burst" | "fade";

/**
 * Two partner cards that slide in from either side and connect to the Spark
 * mark in the middle: the links draw in towards the centre, then a red glow
 * pulses behind the mark. Plays each time the block scrolls into view and
 * resets (instantly) once it has fully left. Stacks vertically on mobile.
 */
export function PartnershipConnect({ partners }: { partners: [PartnerCard, PartnerCard] }) {
  const motion = useMotion();
  const { isMobile } = useViewport();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [glow, setGlow] = useState<Glow>("idle");

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    if (!on && r.top < vh * 0.7 && r.bottom > vh * 0.2) setOn(true);
    else if (on && (r.top > vh || r.bottom < 0)) setOn(false);
  }, motion);

  useEffect(() => {
    if (!on || !motion) return;
    const timers = [setTimeout(() => setGlow("burst"), GLOW_AT), setTimeout(() => setGlow("fade"), GLOW_OUT_AT)];
    return () => {
      timers.forEach(clearTimeout);
      setGlow("idle");
    };
  }, [on, motion]);

  const shown = on || !motion;
  // Entering animates; resetting after leaving is instant so it's ready to replay.
  const transition = (value: string): CSSProperties => ({ transition: motion && on ? value : "none" });

  const card = (partner: PartnerCard, side: -1 | 1) => (
    <div
      className="flex min-w-0 flex-col items-center gap-3.5 rounded-card border border-white/14 bg-ink/60 p-[clamp(20px,2.4cqw,36px)] will-change-[transform,opacity] max-md:w-full max-md:max-w-[320px]"
      style={{
        ...transition(`transform 1.1s ${EASE}, opacity .8s ${EASE}`),
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : isMobile ? `translate3d(0,${side * 60}px,0)` : `translate3d(${side * SLIDE}px,0,0)`,
      }}
    >
      <div className="relative h-[clamp(26px,2.6cqw,40px)] w-full">
        <Image
          src={partner.logo.src}
          alt={partner.logo.alt}
          fill
          unoptimized
          className={cn("object-contain", partner.invert && "opacity-92 brightness-0 invert")}
        />
      </div>
      <span className="text-center text-[clamp(14px,1.2cqw,17px)] font-medium text-snow">{partner.name}</span>
      <span className="text-xs text-fog-500">{partner.label}</span>
    </div>
  );

  // The connecting line between a card and the centre; draws in towards the centre.
  const link = (from: "start" | "end") => {
    const hidden = isMobile
      ? from === "start" ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)"
      : from === "start" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
    return (
      <span className="relative bg-white/12 max-md:h-10 max-md:w-px md:h-px">
        <span
          className="absolute inset-0 bg-brand"
          style={{
            ...transition("clip-path .7s cubic-bezier(.65,0,.35,1) .9s"),
            clipPath: shown ? "inset(0)" : hidden,
          }}
        />
      </span>
    );
  };

  return (
    <div
      ref={ref}
      className="mx-auto flex max-w-[1080px] flex-col items-center md:grid md:grid-cols-[minmax(0,1fr)_minmax(40px,1fr)_auto_minmax(40px,1fr)_minmax(0,1fr)]"
    >
      {card(partners[0], -1)}
      {link("start")}
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[340%] rounded-full bg-[radial-gradient(circle,rgba(207,74,76,0.75)_0%,rgba(185,56,58,0.35)_28%,rgba(185,56,58,0)_65%)]"
          style={{
            transition:
              glow === "burst"
                ? `transform 1s ${EASE}, opacity .35s ease-out`
                : glow === "fade"
                  ? `transform 1.2s ${EASE}, opacity 1.2s ease-in`
                  : "none",
            opacity: glow === "burst" ? 1 : 0,
            transform: `translate(-50%,-50%) scale(${glow === "burst" ? 1 : glow === "fade" ? 1.25 : 0.3})`,
          }}
        />
        <div
          className="relative flex size-[clamp(84px,8cqw,120px)] items-center justify-center rounded-full border border-brand bg-ink"
          style={{
            ...transition(`transform .8s ${EASE}, opacity .6s`),
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "scale(.7)",
          }}
        >
          <BrandLogo className="h-auto w-[66%]" />
        </div>
      </div>
      {link("end")}
      {card(partners[1], 1)}
    </div>
  );
}
