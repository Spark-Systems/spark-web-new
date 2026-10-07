"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { ParticleSphere } from "@/lib/canvas/particle-sphere";
import { clamp, easeOutCubic } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import type { AiCapability } from "@/types/content";

const SCENE_LENGTH = 3.1; // in viewport heights, when pinned
/** Steps (scroll progress) by which the cloud has fully become a sphere. */
const SPHERE_AT = 2.5;
/** How quickly card reveals catch up with scroll (higher = snappier). */
const REVEAL_RATE = 9;
/** Share of a step (0–1) over which a card fades in while the swarm flies to it. */
const REVEAL_SPAN = 0.8;
/** How far (in steps) the user scrolls before the scene steps. */
const STEP_THRESHOLD = 0.04;
/** Duration (s) of the glide to a step; input is locked meanwhile. */
const STEP_SECONDS = 0.8;

interface AiSceneProps {
  heading: ReactNode;
  capabilities: AiCapability[];
}

/**
 * Glowing red particles behind the heading that start as a loose, drifting
 * cloud and gather into a rotating sphere as the capability cards appear.
 *
 * On desktop the section pins and works as a stepper: a small scroll steps to
 * the next (or previous) card, and the page glides, input locked, to that
 * step's scroll position. Past either end the page scrolls normally. On mobile
 * (or when the content is taller than the screen) it scrolls normally and the
 * sphere forms as the last card comes into view.
 */
export function AiScene({ heading, capabilities }: AiSceneProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const { vh, isMobile } = useViewport();
  const seqRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sphereRef = useRef<ParticleSphere | null>(null);
  const reveals = useRef<number[]>(capabilities.map(() => 1));
  const lastTime = useRef(0);
  const stepper = useRef({ step: 0, lockedUntil: 0 });
  const [pinned, setPinned] = useState(false);
  const steps = capabilities.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const sphere = new ParticleSphere(canvas);
    sphereRef.current = sphere;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      sphere.setPointer(e.clientX - r.left, e.clientY - r.top);
    };
    const onLeave = () => sphere.clearPointer();
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerdown", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onMove);
      section.removeEventListener("pointerleave", onLeave);
      sphereRef.current = null;
    };
  }, []);

  /** Pinned range (px) the scene scrolls through, from the first step to the last. */
  const rangeOf = (seq: HTMLElement, section: HTMLElement) => Math.max(1, seq.offsetHeight - section.offsetHeight);

  /** Make `index` the active step and glide the page to it, locking input until it lands. */
  const stepTo = (index: number) => {
    const seq = seqRef.current;
    const section = sectionRef.current;
    if (!seq || !section) return;
    stepper.current = { step: index, lockedUntil: performance.now() + STEP_SECONDS * 1000 + 100 };
    const y = window.scrollY + seq.getBoundingClientRect().top + (index * rangeOf(seq, section)) / steps;
    if (controller) controller.glideTo(y, STEP_SECONDS, { lock: true });
    else window.scrollTo(0, y);
  };

  useFrame((now) => {
    const seq = seqRef.current;
    const section = sectionRef.current;
    if (!seq || !section) return;

    const winH = window.innerHeight;
    const shouldPin = motion && !isMobile && section.scrollHeight <= winH + 2;
    if (shouldPin !== pinned) setPinned(shouldPin);

    // Continuous progress through the scene: 0 → steps.
    let progress: number;
    if (!motion) {
      progress = steps;
    } else if (pinned) {
      // Raw scroll position through the pinned range, in steps (may run past either end).
      const raw = (-seq.getBoundingClientRect().top / rangeOf(seq, section)) * steps;
      const s = stepper.current;
      // Outside the range keep the step in sync with the nearest end;
      // inside it, a small scroll away from the current step moves one step.
      if (raw <= 0) s.step = 0;
      else if (raw >= steps) s.step = steps;
      else if (now >= s.lockedUntil && !controller?.gliding) {
        if (raw > s.step + STEP_THRESHOLD) stepTo(Math.min(steps, s.step + 1));
        else if (raw < s.step - STEP_THRESHOLD) stepTo(Math.max(0, s.step - 1));
      }
      progress = s.step;
    } else {
      progress = cardRefs.current.reduce((sum, card) => {
        if (!card) return sum;
        return sum + clamp((winH * 0.95 - card.getBoundingClientRect().top) / (winH * 0.35));
      }, 0);
    }

    const dt = Math.min(0.05, Math.max(0, (now - (lastTime.current || now)) / 1000));
    lastTime.current = now;

    const box = section.getBoundingClientRect();
    if (box.bottom < 0 || box.top > winH) return;

    // Cards fade up as scroll progresses, eased towards their target so they glide.
    const revealEase = 1 - Math.exp(-dt * REVEAL_RATE);
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      let target = 1;
      if (motion && pinned) target = clamp((progress - i) / REVEAL_SPAN);
      else if (motion) target = clamp((winH * 0.95 - card.getBoundingClientRect().top) / (winH * 0.35));

      const prev = reveals.current[i];
      const next = motion ? prev + (target - prev) * revealEase : 1;
      if (Math.abs(next - prev) < 0.0005 && card.style.opacity !== "") return;
      reveals.current[i] = next;

      const e = easeOutCubic(next);
      card.style.opacity = e.toFixed(3);
      card.style.transform = e > 0.999 ? "none" : `translate3d(0,${((1 - e) * 56).toFixed(1)}px,0) scale(${(0.96 + 0.04 * e).toFixed(4)})`;
      card.style.filter = e > 0.999 ? "none" : `blur(${((1 - e) * 6).toFixed(2)}px)`;
    });

    // The sphere forms over the first steps (pinned) or as the last card comes into view.
    let order = 1;
    if (motion && pinned) order = clamp(progress / SPHERE_AT);
    else if (motion) {
      const last = cardRefs.current.at(-1);
      order = last ? clamp((winH * 0.95 - last.getBoundingClientRect().top) / (winH * 0.5)) : 1;
    }
    sphereRef.current?.render({ order, time: now / 1000, scroll: window.scrollY, still: !motion });
  });

  return (
    <div ref={seqRef} className="relative" style={{ height: pinned ? Math.round(vh * SCENE_LENGTH) : "auto" }}>
      <section
        ref={sectionRef}
        id="ai"
        className={cn(
          "bg-texture px-gutter top-0 box-border flex flex-col justify-center overflow-hidden py-[clamp(32px,6vh,80px)] text-snow",
          pinned ? "sticky h-screen" : "relative",
        )}
      >
        <div className="relative mb-[clamp(20px,4vh,48px)] flex min-h-[clamp(260px,44vh,560px)] flex-auto flex-col items-center justify-center gap-6 text-center">
          {/* Spans the section's full width and top padding, so the sphere sits behind the heading. */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="bleed-gutter pointer-events-none absolute inset-x-0 -top-[clamp(32px,6vh,80px)] bottom-0 block h-[calc(100%+clamp(32px,6vh,80px))] w-[calc(100%+2*clamp(20px,5.5cqw,88px))]"
          />
          {/* Darkens the middle so the heading reads over the particles. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_42%_at_50%_50%,rgba(0,0,0,0.6),rgba(0,0,0,0))]"
          />
          <div className="relative flex flex-col items-center gap-6">{heading}</div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[clamp(12px,2cqw,28px)]">
          {capabilities.map((cap, i) => (
            <div
              key={cap.title}
              ref={(el) => void (cardRefs.current[i] = el)}
              className="relative flex flex-col gap-[clamp(14px,3vh,48px)] rounded-card border border-white/12 bg-white/2.5 p-[clamp(18px,min(2.6cqw,3.4vh),40px)] will-change-[opacity,transform,filter]"
            >
              <div className="flex flex-col gap-3.5">
                <span className="block h-0.5 w-7 bg-brand" />
                <span className="text-[clamp(24px,2cqw,30px)] font-medium tracking-[-0.02em]">{cap.title}</span>
              </div>
              <p className="m-0 text-pretty text-[clamp(14px,1.2cqw,17px)] leading-normal text-lavender-200">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
