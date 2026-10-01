"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { useWheelSteps } from "@/hooks/use-wheel-steps";
import { clamp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import type { Solution } from "@/types/content";
import { SolutionImageSlide, SolutionTextSlide } from "./solution-panels";

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

interface SolutionsSceneProps {
  solutions: Solution[];
  heading: ReactNode;
  footer: ReactNode;
}

/**
 * Pinned two-panel slider: as the user scrolls, the image reel slides down
 * while the copy reel slides up, one solution per step.
 */
export function SolutionsScene({ solutions, heading, footer }: SolutionsSceneProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const { vh, isMobile } = useViewport();
  const steps = solutions.length - 1;
  const layout = getLayout(vh, isMobile, steps);

  const sceneRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useFrame(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Which slide the pinned scroll position maps to.
    const pinned = clamp(layout.pinTop - scene.getBoundingClientRect().top, 0, layout.range);
    const next = Math.round((pinned / layout.range) * steps);
    if (next !== active) setActive(next);
  });

  const measure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return null;
    return { live: layout.pinTop - scene.getBoundingClientRect().top, range: layout.range };
  }, [layout.pinTop, layout.range]);

  useWheelSteps(sceneRef, { steps, measure });

  const goTo = (index: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const target =
      window.scrollY + scene.getBoundingClientRect().top - layout.pinTop + (index * layout.range) / steps;
    if (controller) controller.tweenTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  const reelTransition = motion ? "transform 0.9s cubic-bezier(.7,0,.2,1)" : "none";

  return (
    <section
      id="solutions"
      className="px-gutter bg-ink py-[clamp(64px,7cqw,112px)] text-snow"
    >
      <div ref={sceneRef} className="relative" style={{ height: layout.sceneH }}>
        <div className="sticky z-[2]" style={{ top: layout.pinTop }}>
          <div
            className="relative z-[2] mb-4 flex flex-wrap content-end items-end justify-between gap-x-6 gap-y-3"
            style={{ height: layout.titleH }}
          >
            {heading}
          </div>

          <div
            className="relative grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-[clamp(10px,1.2cqw,18px)] md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
            style={{ height: layout.stageH }}
          >
            <div className="relative overflow-hidden rounded-card bg-surface">
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translate3d(0,${active * 100}%,0)`, transition: reelTransition }}
              >
                {solutions.map((s, i) => (
                  <SolutionImageSlide key={s.id} solution={s} index={i} />
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-card bg-brand">
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translate3d(0,${-active * 100}%,0)`, transition: reelTransition }}
              >
                {solutions.map((s, i) => (
                  <SolutionTextSlide key={s.id} solution={s} index={i} />
                ))}
              </div>

              <div className="absolute bottom-[clamp(22px,2.4cqw,36px)] right-[clamp(22px,2.4cqw,36px)] z-[2] flex gap-1.5">
                {solutions.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={s.title}
                    aria-current={i === active}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full border-0 bg-snow p-0 transition-[width,opacity] duration-500 ease-swift",
                      i === active ? "w-7 opacity-100" : "w-2 opacity-40",
                    )}
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
