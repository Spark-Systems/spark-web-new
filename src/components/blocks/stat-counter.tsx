"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { useInViewOnce } from "@/hooks/use-in-view";
import { easeOutExpo } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import type { Stat } from "@/types/content";

const DURATION_MS = 2600;

const sizes = {
  md: {
    value: "text-[clamp(40px,4.2cqw,68px)] tracking-[-0.03em]",
    label: "text-[17px] leading-[1.35]",
    gap: "gap-1.5",
  },
  lg: {
    value: "text-[clamp(48px,6cqw,96px)] tracking-[-0.045em]",
    label: "text-[clamp(14px,1.1cqw,16px)] leading-[1.4]",
    gap: "gap-3",
  },
  xl: {
    value: "text-[clamp(96px,14cqw,220px)] leading-[0.9] tracking-[-0.06em]",
    label: "text-[clamp(18px,1.5cqw,22px)] leading-[1.4]",
    gap: "gap-5",
  },
} as const;

type StatCounterProps = Stat & {
  size?: keyof typeof sizes;
  /** Background it sits on; sets the label colour. */
  tone?: "dark" | "light";
  className?: string;
};

/** A big number that counts up from zero the first time it scrolls into view. */
export function StatCounter({ value, suffix = "", label, size = "md", tone = "dark", className }: StatCounterProps) {
  const s = sizes[size];
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
    <div ref={ref} className={cn("flex flex-col", s.gap, className)}>
      <div className={cn("font-medium leading-none tabular-nums", s.value)}>
        {display}
        {suffix}
      </div>
      <div className={cn(tone === "dark" ? "text-fog-500" : "text-ink-700", s.label)}>{label}</div>
    </div>
  );
}
