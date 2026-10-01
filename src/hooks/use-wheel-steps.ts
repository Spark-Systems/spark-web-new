"use client";

import { useEffect, type RefObject } from "react";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";

export interface StepGeometry {
  /** How far (px) the pinned scene has scrolled, 0 → range. */
  live: number;
  /** Total pinned scroll distance in px. */
  range: number;
}

interface Options {
  steps: number;
  enabled?: boolean;
  /** Return the current geometry, or null when the scene can't be measured. */
  measure: () => StepGeometry | null;
}

/**
 * Turns wheel gestures inside a pinned scene into discrete, eased steps
 * (one gesture = one step), releasing normal scrolling at either end.
 */
export function useWheelSteps(ref: RefObject<HTMLElement | null>, { steps, enabled = true, measure }: Options) {
  const controller = useScrollController();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !controller) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      const geo = measure();
      if (!geo || !geo.range) return;
      if (controller.shouldSwallowWheel(performance.now())) {
        e.preventDefault();
        return;
      }

      const { live, range } = geo;
      const pinned = live >= -2 && live <= range + 2;
      const step = range / steps;
      const current = Math.max(0, Math.min(steps, Math.round(live / step)));
      const next = current + (e.deltaY > 0 ? 1 : -1);
      if (!pinned || next < 0 || next > steps) return;

      e.preventDefault();
      controller.gestureConsumed = true;
      controller.tweenTo(window.scrollY + (next * step - Math.max(0, Math.min(range, live))));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref, enabled, controller, steps, measure]);
}
