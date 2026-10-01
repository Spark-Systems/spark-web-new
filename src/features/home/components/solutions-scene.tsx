"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp } from "@/lib/motion/math";
import type { Solution } from "@/types/content";
import { SolutionImageSlide, SolutionTextSlide } from "./solution-panels";

/** How quickly the reels catch up with scroll (higher = snappier). */
const FOLLOW_RATE = 12;
/** Idle time (ms) after the last scroll movement before settling on a slide. */
const SETTLE_DELAY = 140;
/** Duration (s) of the settle glide. */
const SETTLE_SECONDS = 0.6;

/** Scroll geometry for the pinned scene, derived from the viewport. */
function getLayout(vh: number, isMobile: boolean, steps: number) {
  const titleH = isMobile ? 140 : 96;
  const head = titleH + 16;
  const stageH = Math.round(
    isMobile ? clamp(vh - head - 48, 380, 520) : clamp(vh - head - 72, 360, 560),
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
 * Pinned two-panel slider, scrubbed by scroll: the image reel slides down
 * while the copy reel slides up. Motion is continuous (no wheel hijacking);
 * when the user stops between two slides, the page glides to the nearest one.
 * Off-centre slides zoom and dim, and their copy fades, for a sense of depth.
 */
export function SolutionsScene({ solutions, heading, footer }: SolutionsSceneProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const { vh, isMobile } = useViewport();
  const steps = solutions.length - 1;
  const layout = getLayout(vh, isMobile, steps);

  const sceneRef = useRef<HTMLDivElement>(null);
  const imageReelRef = useRef<HTMLDivElement>(null);
  const copyReelRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const layers = useRef<SlideLayers>({ media: [], shade: [], copy: [] });
  const state = useRef({ progress: -1, lastY: 0, lastMoveAt: 0, lastTime: 0, armed: false });
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
    const target = clamp(raw, 0, steps);

    // Settle on the nearest slide once the user stops scrolling mid-scene.
    const y = window.scrollY;
    if (Math.abs(y - s.lastY) > 0.5) {
      s.lastMoveAt = now;
      s.armed = true;
    }
    s.lastY = y;
    const inside = raw > 0.02 && raw < steps - 0.02;
    if (
      motion &&
      controller &&
      s.armed &&
      inside &&
      !controller.gliding &&
      !controller.touching &&
      now - s.lastMoveAt > SETTLE_DELAY
    ) {
      s.armed = false;
      const nearest = Math.round(raw);
      if (Math.abs(raw - nearest) > 0.005) controller.glideTo(y + ((nearest - raw) * layout.range) / steps, SETTLE_SECONDS);
    }

    // Ease the visual progress towards scroll so the reels glide.
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

  const goTo = (index: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (controller) controller.glideTo(toScrollY(index, scene));
    else window.scrollTo({ top: toScrollY(index, scene), behavior: "smooth" });
  };

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
            className="relative grid auto-rows-fr grid-cols-1 gap-[clamp(10px,1.2cqw,18px)] md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
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
                    onClick={() => goTo(i)}
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
