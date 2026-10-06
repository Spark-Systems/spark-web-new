"use client";

import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";

/** Opacity of a word before it fills in. */
const DIM = 0.18;
/** How many words the fill front spans (higher = softer edge). */
const SOFTNESS = 2.5;

/**
 * A statement whose words fill in from dim to full, one after another, as it
 * scrolls up through the viewport. Screen readers get the plain text.
 */
export function ScrollFillText({ text, className }: { text: string; className?: string }) {
  const motion = useMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const lastP = useRef(-1);
  const words = text.split(/\s+/);

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const vh = innerHeight;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    // 0 as its top reaches 85% down the screen → 1 once its middle passes 30%.
    const p = clamp((vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.5));
    if (p === lastP.current) return;
    lastP.current = p;
    const front = p * (words.length + 2);
    el.querySelectorAll<HTMLElement>("[data-fill-word]").forEach((word, i) => {
      word.style.opacity = (DIM + (1 - DIM) * clamp((front - i) / SOFTNESS)).toFixed(3);
    });
  }, motion);

  return (
    <p ref={ref} aria-label={text} className={className}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span data-fill-word="" style={{ opacity: motion ? DIM : 1 }}>
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}
