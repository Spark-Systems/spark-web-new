"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp, easeInOutCubic, easeOutCubic, lerp } from "@/lib/motion/math";
import type { BallSwarm } from "@/lib/three/ball-swarm";
import { cn } from "@/lib/utils";
import type { AiCapability } from "@/types/content";

const SCENE_LENGTH = 3.1; // in viewport heights, when pinned
/** Formation "order" at each anchor (0 = scattered cloud, 1 = grid). */
const ORDER_AT_STEP = [0, 0.4, 0.74, 1];
/** How quickly the formation catches up with its scroll target (higher = snappier). */
const FOLLOW_RATE = 7;
/** How quickly card reveals catch up with scroll (higher = snappier). */
const REVEAL_RATE = 9;
/** Share of a step (0–1) over which a card fades in while the swarm flies to it. */
const REVEAL_SPAN = 0.8;
/** How far (in steps) the user scrolls before the scene steps. */
const STEP_THRESHOLD = 0.04;
/** Duration (s) of the glide to a step; input is locked meanwhile. */
const STEP_SECONDS = 0.8;

interface Anchor {
  x: number;
  y: number;
  size: number;
}

/** Centre and size of `el`, relative to `origin`. */
function anchorOf(el: Element, origin: DOMRect): Anchor {
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left + r.width / 2, y: r.top - origin.top + r.height / 2, size: r.width };
}

interface AiSceneProps {
  heading: ReactNode;
  capabilities: AiCapability[];
}

/**
 * A three.js swarm of spheres that starts as a loose cloud beside the heading.
 * As the user scrolls and each capability card appears, the swarm flies to
 * that card's top-right corner, tightening into a grid as it goes.
 *
 * On desktop the section pins and works as a stepper: scroll doesn't scrub
 * the swarm — a small scroll steps it to the next (or previous) card, and the
 * page glides, input locked, to that step's scroll position. Past either end
 * the page scrolls normally. On mobile (or when the content is taller than
 * the screen) it scrolls normally and progress follows the cards entering
 * the viewport.
 */
export function AiScene({ heading, capabilities }: AiSceneProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const { vh, isMobile } = useViewport();
  const seqRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroSlotRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const swarmRef = useRef<BallSwarm | null>(null);
  const follow = useRef<(Anchor & { order: number }) | null>(null);
  const reveals = useRef<number[]>(capabilities.map(() => 1));
  const lastTime = useRef(0);
  const stepper = useRef({ step: 0, lockedUntil: 0 });
  const [pinned, setPinned] = useState(false);
  const steps = capabilities.length;

  // three.js is loaded on demand so it stays out of the initial bundle.
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let disposed = false;
    let cleanup = () => {};

    import("@/lib/three/ball-swarm").then(({ BallSwarm }) => {
      if (disposed) return;
      const swarm = new BallSwarm(canvas);
      swarmRef.current = swarm;

      const resize = () => swarm.setSize(section.clientWidth, section.clientHeight);
      const observer = new ResizeObserver(resize);
      observer.observe(section);
      resize();

      const onMove = (e: PointerEvent) => {
        const r = section.getBoundingClientRect();
        swarm.setPointer(e.clientX - r.left, e.clientY - r.top);
      };
      const onLeave = () => swarm.clearPointer();
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerdown", onMove);
      section.addEventListener("pointerleave", onLeave);

      cleanup = () => {
        observer.disconnect();
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerdown", onMove);
        section.removeEventListener("pointerleave", onLeave);
        swarm.dispose();
        swarmRef.current = null;
      };
    });

    return () => {
      disposed = true;
      cleanup();
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
    const heroSlot = heroSlotRef.current;
    if (!seq || !section || !heroSlot) return;

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

    const swarm = swarmRef.current;
    if (!swarm) return;

    // Anchor 0 is the slot beside the heading; anchor k is card k's top-right corner.
    const anchors = [heroSlot, ...cornerRefs.current].map((el) => (el ? anchorOf(el, box) : null));
    const k = Math.min(steps - 1, Math.floor(progress));
    const t = easeInOutCubic(progress - k);
    const from = anchors[k];
    const to = anchors[k + 1] ?? from;
    if (!from || !to) return;

    const target = {
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      size: lerp(from.size, to.size, t),
      order: lerp(ORDER_AT_STEP[k], ORDER_AT_STEP[k + 1] ?? 1, t),
    };

    // Ease towards the target so the swarm glides instead of tracking scroll 1:1.
    const cur = follow.current;
    if (!cur || !motion) {
      follow.current = target;
    } else {
      const a = 1 - Math.exp(-dt * FOLLOW_RATE);
      cur.x += (target.x - cur.x) * a;
      cur.y += (target.y - cur.y) * a;
      cur.size += (target.size - cur.size) * a;
      cur.order += (target.order - cur.order) * a;
    }

    swarm.render({ ...follow.current!, time: motion ? now / 1000 : 0, dt, still: !motion });
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
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] size-full" />

        <div className="mb-[clamp(20px,4vh,56px)] flex items-center justify-between gap-[clamp(24px,4cqw,64px)]">
          <div className="flex min-w-0 max-w-[980px] flex-1 flex-col gap-7">{heading}</div>
          {/* Where the swarm starts; the canvas above draws it here. */}
          <div ref={heroSlotRef} aria-hidden="true" className="aspect-square w-[clamp(160px,min(34cqw,42vh),480px)] flex-none" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[clamp(12px,2cqw,28px)]">
          {capabilities.map((cap, i) => (
            <div
              key={cap.title}
              ref={(el) => void (cardRefs.current[i] = el)}
              className="relative flex flex-col gap-[clamp(14px,3vh,48px)] rounded-card border border-white/12 bg-white/2.5 p-[clamp(18px,min(2.6cqw,3.4vh),40px)] will-change-[opacity,transform,filter]"
            >
              {/* Landing spot for the swarm: overhangs the card's top-right corner. */}
              <span
                ref={(el) => void (cornerRefs.current[i] = el)}
                aria-hidden="true"
                className="pointer-events-none absolute -right-[clamp(12px,2.6cqw,40px)] -top-[clamp(12px,2.6cqw,40px)] block size-[clamp(96px,10cqw,152px)]"
              />
              <div className="flex flex-col gap-3.5 pr-[clamp(84px,8.4cqw,124px)]">
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
