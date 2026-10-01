"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useMotion } from "@/components/providers/motion-provider";

type Phase = "in" | "out" | "enter";

const EASE = "cubic-bezier(.7,0,.2,1)";
const FIRST_DELAY_MS = 2200;
const HOLD_MS = 2000;
const OUT_MS = 460;

const phaseStyle: Record<Phase, CSSProperties> = {
  in: { transform: "none", opacity: 1, transition: `transform .5s ${EASE}, opacity .5s ${EASE}` },
  out: {
    transform: "translateY(-100%) rotateX(80deg)",
    opacity: 0,
    transition: `transform .45s ${EASE}, opacity .45s ${EASE}`,
  },
  enter: { transform: "translateY(100%) rotateX(-80deg)", opacity: 0, transition: "none" },
};

/** Cycles through `words` with a 3D flip, like a split-flap display. */
export function RotatingWord({ words }: { words: readonly string[] }) {
  const motion = useMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    if (!motion) return;
    let timer: ReturnType<typeof setTimeout>;
    let raf = 0;

    const flip = () => {
      setPhase("out");
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("enter");
        // Let the "enter" pose paint before transitioning back in.
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => setPhase("in"));
        });
        timer = setTimeout(flip, HOLD_MS);
      }, OUT_MS);
    };

    timer = setTimeout(flip, FIRST_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [motion, words.length]);

  return (
    <span className="block h-[1.3em] overflow-hidden px-0.5 [perspective:200px]">
      <span
        aria-live="off"
        className="block leading-[1.3em] [transform-origin:50%_50%_-0.6em] will-change-[transform,opacity]"
        style={phaseStyle[phase]}
      >
        {words[index]}
      </span>
    </span>
  );
}
