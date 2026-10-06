"use client";

import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { Reveal } from "@/components/ui/reveal";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";

interface TimelineStep {
  title: string;
  body: string;
}

/**
 * Numbered steps down a vertical line (for dark sections). A red bar fills
 * the line from the top as the steps scroll up past the middle of the screen.
 */
export function TimelineSteps({ steps }: { steps: TimelineStep[] }) {
  const motion = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const lastP = useRef(-1);

  useFrame(() => {
    const wrap = ref.current;
    const bar = barRef.current;
    if (!wrap || !bar) return;
    const r = wrap.getBoundingClientRect();
    // Filled down to wherever 60% of the screen height falls on the line.
    const p = clamp((innerHeight * 0.6 - r.top) / r.height);
    if (p === lastP.current) return;
    lastP.current = p;
    bar.style.transform = `scaleY(${p.toFixed(4)})`;
  }, motion);

  return (
    <div ref={ref} className="relative pl-[clamp(28px,3cqw,48px)]">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-white/14" />
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute inset-y-0 left-0 -ml-px w-0.5 origin-top bg-brand-bright"
        style={{ transform: motion ? "scaleY(0)" : "none" }}
      />
      <ol className="m-0 list-none p-0">
        {steps.map((step, i) => (
          <Reveal
            as="li"
            key={step.title}
            className="flex flex-col gap-3 border-b border-white/8 py-[clamp(32px,6vh,64px)]"
          >
            <span className="font-mono text-[13px] text-brand-bright">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="m-0 text-[clamp(28px,2.6cqw,40px)] font-medium tracking-[-0.03em]">{step.title}</h3>
            <p className="m-0 max-w-[40ch] text-[clamp(16px,1.3cqw,19px)] leading-normal text-fog-400">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
