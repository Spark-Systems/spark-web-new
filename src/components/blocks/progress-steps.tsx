"use client";

import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";
import type { ProcessStep } from "@/types/content";

/**
 * Numbered steps along a line (for light sections). A red progress bar draws
 * across the line as the steps scroll up the screen.
 */
export function ProgressSteps({ steps }: { steps: ProcessStep[] }) {
  const motion = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const lastP = useRef(-1);

  useFrame(() => {
    const wrap = ref.current;
    const bar = barRef.current;
    if (!wrap || !bar) return;
    const r = wrap.getBoundingClientRect();
    // 0 as the steps reach 80% down the screen → 1 after 70% of their height has passed.
    const p = clamp((innerHeight * 0.8 - r.top) / (r.height * 0.7));
    if (p === lastP.current) return;
    lastP.current = p;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }, motion);

  return (
    <div ref={ref} className="relative">
      <span aria-hidden="true" className="absolute inset-x-0 top-7 h-px bg-ink/14" />
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-[27.5px] h-0.5 origin-left bg-brand"
        style={{ transform: motion ? "scaleX(0)" : "none" }}
      />
      <ol className="relative m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[clamp(28px,3cqw,48px)] p-0">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.title} delay={i * 120} className="flex flex-col gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-ink text-2xl text-snow">
              <Icon name={step.icon} />
            </span>
            <span className="font-mono text-[13px] text-brand">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="m-0 text-[clamp(22px,2cqw,28px)] font-medium tracking-[-0.02em]">{step.title}</h3>
            <p className="m-0 max-w-[28ch] text-[15px] leading-normal text-ink-700">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
