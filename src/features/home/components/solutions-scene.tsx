"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp } from "@/lib/motion/math";
import type { Solution } from "@/types/content";
import { SolutionImageSlide, SolutionTextSlide } from "./solution-panels";

/** How quickly the reels move to the active slide (higher = snappier). */
const FOLLOW_RATE = 7;
/** How far (in slides) the user scrolls before the slide steps. */
const STEP_THRESHOLD = 0.04;
/** Duration (s) of the glide to a slide; input is locked meanwhile. */
const STEP_SECONDS = 0.8;

/** Below this width (tablet and mobile) the panels stack: image above, copy below. */
const STACKED_MAX_WIDTH = 1024;

/**
 * Scroll geometry for the pinned scene, derived from the viewport.
 * `stacked` is the single-column layout; tablets get a taller stage than phones.
 */
function getLayout(vh: number, isMobile: boolean, stacked: boolean, steps: number) {
  const titleH = isMobile ? 140 : 96;
  const head = titleH + 16;
  const stageH = Math.round(
    stacked ? clamp(vh - head - 48, 380, isMobile ? 520 : 760) : clamp(vh - head - 72, 360, 560),
  );
  const stagePin = Math.round(head + Math.max(20, (vh - head - stageH) / 2));
  const range = steps * Math.round(vh * 0.6);
  return { titleH, stageH, pinTop: stagePin - head, sceneH: head + stageH + range, range };
}

interface SlideLayers {
  media: HTMLElement[];
  shade: HTMLElement[];
  copy: HTMLElement[];
}

interface SolutionsSceneProps {
  solutions: Solution[];
  heading: ReactNode;
  footer: ReactNode;
}

/**
 * Pinned two-panel stepper: the image reel slides down while the copy reel
 * slides up. Scroll doesn't scrub the reels — a small scroll inside the scene
 * steps to the next (or previous) slide, and the page glides, input locked,
 * to that slide's scroll position. Past either end the page scrolls normally.
 * Off-centre slides zoom and dim, and their copy fades, for a sense of depth.
 */
export function SolutionsScene({ solutions, heading, footer }: SolutionsSceneProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const { vh, vw, isMobile } = useViewport();
  const steps = solutions.length - 1;
  const layout = getLayout(vh, isMobile, vw < STACKED_MAX_WIDTH, steps);

  const sceneRef = useRef<HTMLDivElement>(null);
  const imageReelRef = useRef<HTMLDivElement>(null);
  const copyReelRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const layers = useRef<SlideLayers>({ media: [], shade: [], copy: [] });
  const state = useRef({ progress: -1, step: 0, lockedUntil: 0, lastTime: 0 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const q = (root: HTMLElement | null, sel: string) => [...(root?.querySelectorAll<HTMLElement>(sel) ?? [])];
    layers.current = {
      media: q(imageReelRef.current, "[data-slide-media]"),
      shade: q(imageReelRef.current, "[data-slide-shade]"),
      copy: q(copyReelRef.current, "[data-slide-copy]"),
    };
  }, [solutions]);

  const toScrollY = (index: number, scene: HTMLElement) =>
    window.scrollY + scene.getBoundingClientRect().top - layout.pinTop + (index * layout.range) / steps;

  /** Make `index` the active slide and glide the page to it, locking input until it lands. */
  const stepTo = (index: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const s = state.current;
    s.step = index;
    s.lockedUntil = performance.now() + STEP_SECONDS * 1000 + 100;
    if (controller) controller.glideTo(toScrollY(index, scene), motion ? STEP_SECONDS : 0, { lock: true });
    else window.scrollTo(0, toScrollY(index, scene));
  };

  useFrame((now) => {
    const scene = sceneRef.current;
    const imageReel = imageReelRef.current;
    const copyReel = copyReelRef.current;
    if (!scene || !imageReel || !copyReel) return;
    const s = state.current;

    const dt = Math.min(0.05, Math.max(0, (now - (s.lastTime || now)) / 1000));
    s.lastTime = now;

    // Raw position through the pinned scene, in slides (may run past either end).
    const raw = ((layout.pinTop - scene.getBoundingClientRect().top) / layout.range) * steps;

    // Outside the pinned range keep the step in sync with the nearest end;
    // inside it, a small scroll away from the current slide steps once.
    if (raw <= 0) s.step = 0;
    else if (raw >= steps) s.step = steps;
    else if (now >= s.lockedUntil && !controller?.gliding) {
      if (raw > s.step + STEP_THRESHOLD) stepTo(Math.min(steps, s.step + 1));
      else if (raw < s.step - STEP_THRESHOLD) stepTo(Math.max(0, s.step - 1));
    }

    // Ease the visual progress towards the active slide so the reels glide.
    const target = s.step;
    const prev = s.progress;
    const p = prev < 0 || !motion ? target : prev + (target - prev) * (1 - Math.exp(-dt * FOLLOW_RATE));
    if (Math.abs(p - prev) < 1e-4) return;
    s.progress = p;

    imageReel.style.transform = `translate3d(0,${(p * 100).toFixed(3)}%,0)`;
    copyReel.style.transform = `translate3d(0,${(-p * 100).toFixed(3)}%,0)`;

    const { media, shade, copy } = layers.current;
    for (let i = 0; i <= steps; i++) {
      const d = i - p;
      const away = Math.min(1, Math.abs(d));
      const near = 1 - away;
      if (media[i]) media[i].style.transform = away < 0.001 ? "none" : `scale(${(1 + 0.18 * away).toFixed(4)})`;
      if (shade[i]) shade[i].style.opacity = (0.55 * away).toFixed(3);
      if (copy[i]) {
        copy[i].style.opacity = clamp(1 - Math.abs(d) * 1.6).toFixed(3);
        copy[i].style.transform = away < 0.001 ? "none" : `translate3d(0,${(d * 56).toFixed(1)}px,0)`;
      }
      const dot = dotRefs.current[i];
      if (dot) {
        dot.style.width = `${(8 + 20 * near).toFixed(2)}px`;
        dot.style.opacity = (0.4 + 0.6 * near).toFixed(3);
      }
    }

    const nextActive = Math.round(p);
    if (nextActive !== active) setActive(nextActive);
  });


  return (
    <section id="solutions" className="px-gutter bg-ink py-[clamp(64px,7cqw,112px)] text-snow">
      <div ref={sceneRef} className="relative" style={{ height: layout.sceneH }}>
        <div className="sticky z-2" style={{ top: layout.pinTop }}>
          <div
            className="relative z-2 mb-4 flex flex-wrap content-end items-end justify-between gap-x-6 gap-y-3"
            style={{ height: layout.titleH }}
          >
            {heading}
          </div>

          <div
            className="relative grid auto-rows-fr grid-cols-1 gap-[clamp(10px,1.2cqw,18px)] lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
            style={{ height: layout.stageH }}
          >
            <div className="relative overflow-hidden rounded-card bg-surface">
              <div ref={imageReelRef} className="absolute inset-0 will-change-transform">
                {solutions.map((s, i) => (
                  <SolutionImageSlide key={s.id} solution={s} index={i} />
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-card bg-brand">
              <div ref={copyReelRef} className="absolute inset-0 will-change-transform">
                {solutions.map((s, i) => (
                  <SolutionTextSlide key={s.id} solution={s} index={i} />
                ))}
              </div>

              <div className="absolute bottom-[clamp(22px,2.4cqw,36px)] right-[clamp(22px,2.4cqw,36px)] z-2 flex gap-1.5">
                {solutions.map((s, i) => (
                  <button
                    key={s.id}
                    ref={(el) => void (dotRefs.current[i] = el)}
                    type="button"
                    aria-label={s.title}
                    aria-current={i === active}
                    onClick={() => stepTo(i)}
                    className="h-2 rounded-full border-0 bg-snow p-0"
                    style={{ width: i === 0 ? 28 : 8, opacity: i === 0 ? 1 : 0.4 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {footer}
    </section>
  );
}
