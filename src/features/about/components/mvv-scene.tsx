"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { Reveal } from "@/components/ui/reveal";
import { useFrame } from "@/hooks/use-frame";
import { useScrollStepper } from "@/hooks/use-scroll-stepper";
import { useViewport } from "@/hooks/use-viewport";
import { clamp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import type { AboutPageData } from "@/types/about";
import { MvvStepCopy } from "./mvv-step-copy";

type MvvSceneProps = AboutPageData["mvv"];

/** How quickly the visuals catch up with the active step (higher = snappier). */
const FOLLOW_RATE = 7;
/** Faint full-bleed background photo opacity for the active step. */
const BACKDROP_OPACITY = 0.08;
/** Size (px) of the red progress dot. */
const DOT = 11;

/** 1 for the active step, fading to 0 by ¾ of a step away. */
const presence = (p: number, i: number) => clamp((0.75 - Math.abs(p - i)) / 0.5);

/**
 * Mission / vision / values. On desktop a pinned stepper: each small scroll
 * moves one step, crossfading the photo, copy and faint backdrop while a red
 * dot travels down the progress line. On mobile the steps simply stack.
 */
export function MvvScene(props: MvvSceneProps) {
  const { isMobile } = useViewport();
  return isMobile ? <MvvStacked {...props} /> : <MvvPinned {...props} />;
}

function MvvPinned({ title, steps }: MvvSceneProps) {
  const motion = useMotion();
  const { vh } = useViewport();
  const last = steps.length - 1;
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const layers = useRef<{ backdrop: HTMLElement[]; photo: HTMLElement[]; copy: HTMLElement[] }>({
    backdrop: [],
    photo: [],
    copy: [],
  });
  const state = useRef({ progress: -1, lastTime: 0 });
  const [active, setActive] = useState(0);

  const range = () => (sectionRef.current?.offsetHeight ?? 0) - innerHeight;
  const stepper = useScrollStepper({
    last,
    toScrollY: (i) => {
      const section = sectionRef.current;
      return section ? scrollY + section.getBoundingClientRect().top + (range() * i) / last : null;
    },
  });

  useFrame((now) => {
    const section = sectionRef.current;
    if (!section || last < 1) return;
    const s = state.current;
    const dt = Math.min(0.05, Math.max(0, (now - (s.lastTime || now)) / 1000));
    s.lastTime = now;

    const raw = (-section.getBoundingClientRect().top / Math.max(1, range())) * last;
    const target = stepper.update(raw, now);
    const prev = s.progress;
    const p = prev < 0 || !motion ? target : prev + (target - prev) * (1 - Math.exp(-dt * FOLLOW_RATE));
    if (Math.abs(p - prev) < 1e-4) return;
    s.progress = p;

    const { backdrop, photo, copy } = layers.current;
    steps.forEach((_, i) => {
      const o = presence(p, i);
      if (backdrop[i]) backdrop[i].style.opacity = (o * BACKDROP_OPACITY).toFixed(3);
      if (photo[i]) {
        photo[i].style.opacity = o.toFixed(3);
        photo[i].style.transform = `scale(${(1 + Math.min(1, Math.abs(p - i)) * 0.06).toFixed(4)})`;
      }
      if (copy[i]) {
        copy[i].style.opacity = o.toFixed(3);
        copy[i].style.transform = `translate3d(0,${((i - p) * 36).toFixed(1)}px,0)`;
        copy[i].style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
    });
    const line = lineRef.current;
    const dot = dotRef.current;
    if (line && dot) dot.style.transform = `translate3d(0,${((p / last) * (line.offsetHeight - DOT)).toFixed(1)}px,0)`;

    const nextActive = Math.round(p);
    if (nextActive !== active) setActive(nextActive);
  });

  const collect = (key: keyof typeof layers.current, i: number) => (el: HTMLElement | null) => {
    if (el) layers.current[key][i] = el;
  };

  return (
    <section ref={sectionRef} className="relative bg-paper text-ink" style={{ height: vh * steps.length }}>
      <div className="px-gutter sticky top-0 box-border flex h-screen items-center overflow-hidden py-[clamp(24px,7vh,120px)]">
        {/* Faint full-bleed backdrop of the active step's photo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {steps.map((step, i) => (
            <div key={step.id} ref={collect("backdrop", i)} className="absolute inset-0" style={{ opacity: i ? 0 : BACKDROP_OPACITY }}>
              <Image src={step.image.src} alt="" fill sizes="100vw" className="object-cover grayscale" />
            </div>
          ))}
        </div>

        <div className="relative grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-center gap-[clamp(32px,6cqw,112px)]">
          <div className="flex flex-col gap-[clamp(28px,3cqw,48px)]">
            <h2 className="m-0 max-w-[12ch] text-balance text-[clamp(36px,4.4cqw,68px)] font-medium leading-[1.02] tracking-[-0.04em]">
              {title}
            </h2>
            <div className="flex flex-col gap-2.5">
              {steps.map((step, i) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => stepper.goTo(i)}
                  aria-current={i === active}
                  className={cn(
                    "flex items-baseline gap-3.5 text-left text-[clamp(16px,1.3cqw,19px)] font-medium text-ink transition-opacity duration-[400ms]",
                    i === active ? "opacity-100" : "opacity-38",
                  )}
                >
                  <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-[clamp(14px,2.4vh,32px)] pl-[clamp(20px,2.4cqw,36px)]">
            <span ref={lineRef} className="absolute inset-y-0 left-0 w-px bg-ink/16" />
            <span
              ref={dotRef}
              className="absolute -left-[5px] top-0 rounded-full bg-brand shadow-[0_0_0_5px_rgba(185,56,58,0.14)] will-change-transform"
              style={{ width: DOT, height: DOT }}
            />

            <div className="relative h-[clamp(140px,34vh,380px)] w-full overflow-hidden rounded-card bg-ink">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  ref={collect("photo", i)}
                  className="absolute inset-0 will-change-[opacity,transform]"
                  style={{ opacity: i ? 0 : 1 }}
                >
                  <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 760px) 50vw, 100vw" className="object-cover" />
                </div>
              ))}
            </div>

            {/* Copy for every step stacked in one cell; only the active one is visible. */}
            <div className="grid">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  ref={collect("copy", i)}
                  aria-hidden={i !== active}
                  className="col-start-1 row-start-1 will-change-[opacity,transform]"
                  style={{ opacity: i ? 0 : 1 }}
                >
                  <MvvStepCopy step={step} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MvvStacked({ title, steps }: MvvSceneProps) {
  return (
    <section className="px-gutter bg-paper py-[clamp(64px,12vw,96px)] text-ink">
      <Reveal
        as="h2"
        className="m-0 mb-12 max-w-[12ch] text-balance text-[clamp(36px,9vw,52px)] font-medium leading-[1.02] tracking-[-0.04em]"
      >
        {title}
      </Reveal>
      <div className="flex flex-col gap-14">
        {steps.map((step) => (
          <Reveal key={step.id} className="flex flex-col gap-6">
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-card bg-ink">
              <Image src={step.image.src} alt={step.image.alt} fill sizes="100vw" className="object-cover" />
            </div>
            <MvvStepCopy step={step} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
