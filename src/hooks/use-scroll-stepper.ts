"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";

interface ScrollStepperOptions {
  /** Index of the last step (steps run 0…last). */
  last: number;
  /** Page scroll position (px) at which step `index` sits; null if not measurable yet. */
  toScrollY: (index: number) => number | null;
  /** How far (in steps) the user scrolls inside the scene before it steps. */
  threshold?: number;
  /** Duration (s) of the glide to a step; input is locked meanwhile. */
  seconds?: number;
  /** Per-move duration override (s), e.g. a longer glide for an intro step. */
  secondsFor?: (from: number, to: number) => number;
}

/**
 * Turns a pinned scroll scene into a stepper: scroll doesn't scrub it, a small
 * scroll inside the scene moves exactly one step and the page glides (input
 * locked) to that step's position. Past either end the page scrolls normally.
 *
 * Call `update(raw, now)` every frame with the raw scroll position in steps
 * (may run past either end); it returns the active step.
 */
export function useScrollStepper({
  last,
  toScrollY,
  threshold = 0.04,
  seconds = 0.8,
  secondsFor,
}: ScrollStepperOptions) {
  const motion = useMotion();
  const controller = useScrollController();
  const state = useRef({ step: 0, lockedUntil: 0 });
  const toY = useRef(toScrollY);
  useEffect(() => {
    toY.current = toScrollY;
  });

  /** Make `index` the active step and glide the page to it. */
  const goTo = useCallback(
    (index: number) => {
      const y = toY.current(index);
      if (y === null) return;
      const duration = secondsFor?.(state.current.step, index) ?? seconds;
      state.current = { step: index, lockedUntil: performance.now() + duration * 1000 + 100 };
      if (controller) controller.glideTo(y, motion ? duration : 0, { lock: true });
      else window.scrollTo(0, y);
    },
    [controller, motion, seconds, secondsFor],
  );

  const update = useCallback(
    (raw: number, now: number) => {
      const s = state.current;
      // Outside the scene keep the step in sync with the nearest end; inside, step once per small scroll.
      if (raw <= 0) s.step = 0;
      else if (raw >= last) s.step = last;
      else if (motion && now >= s.lockedUntil && !controller?.gliding) {
        if (raw > s.step + threshold) goTo(Math.min(last, s.step + 1));
        else if (raw < s.step - threshold) goTo(Math.max(0, s.step - 1));
      } else if (!motion) s.step = Math.round(raw);
      return s.step;
    },
    [last, threshold, motion, controller, goTo],
  );

  return { update, goTo };
}
