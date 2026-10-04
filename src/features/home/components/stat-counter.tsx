"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { useInViewOnce } from "@/hooks/use-in-view";
import { easeOutExpo } from "@/lib/motion/math";
import type { Stat } from "@/types/content";

const DURATION_MS = 2600;

/** A big number that counts up from zero the first time it scrolls into view. */
export function StatCounter({ value, suffix = "", label }: Stat) {
  const motion = useMotion();
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(ref, 0.4);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!motion || !inView) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION_MS);
      setCount(Math.round(value * easeOutExpo(k)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [motion, inView, value]);

  // The server render (and reduced motion) shows the final figure.
  const display = !hydrated || !motion ? value : (count ?? 0);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="text-[clamp(40px,4.2cqw,68px)] font-medium leading-none tracking-[-0.03em] tabular-nums">
        {display}
        {suffix}
      </div>
      <div className="text-[17px] leading-[1.35] text-fog-500">{label}</div>
    </div>
  );
}
