"use client";

import { useRef, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";

/** How much a covered card shrinks and darkens once the next one fully overlaps it. */
const SHRINK = 0.08;
const DIM = 0.55;

/**
 * Vertical stack of sticky cards: each card pins below the header and the
 * next one slides up over it, while the covered card shrinks and dims.
 * Wrap each card in <StackCard>.
 */
export function StackCards({ children, className }: { children: ReactNode; className?: string }) {
  const motion = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<number[]>([]);

  useFrame(() => {
    const wrap = ref.current;
    if (!wrap) return;
    const cards = wrap.querySelectorAll<HTMLElement>("[data-stack-card]");
    const vh = innerHeight;
    cards.forEach((card, i) => {
      const inner = card.firstElementChild as HTMLElement | null;
      const next = cards[i + 1];
      if (!inner) return;
      let k = 0;
      if (next) {
        const top = card.getBoundingClientRect().top;
        // 0 while the next card is a screen away → 1 once it covers this one.
        k = clamp(1 - (next.getBoundingClientRect().top - top) / Math.max(1, vh - top));
      }
      if (last.current[i] === k) return;
      last.current[i] = k;
      inner.style.transform = k ? `scale(${(1 - k * SHRINK).toFixed(4)})` : "none";
      inner.style.filter = k > 0.001 ? `brightness(${(1 - k * DIM).toFixed(3)})` : "none";
    });
  }, motion);

  return (
    <div ref={ref} className={cn("flex flex-col gap-[clamp(24px,4vh,48px)]", className)}>
      {children}
    </div>
  );
}

/** One card in <StackCards>; its single child is what shrinks and dims (scaled from the top). */
export function StackCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-stack-card="" className={cn("sticky top-[clamp(88px,11vh,120px)] h-[min(76vh,720px)]", className)}>
      {children}
    </div>
  );
}
