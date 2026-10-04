"use client";

import { useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";

/**
 * Wraps the footer so it rises, scales up and fades in as it is uncovered.
 */
export function FooterParallax({ className, children }: { className?: string; children: ReactNode }) {
  const motion = useMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLElement>(null);
  const lastK = useRef(-1);

  useFrame(() => {
    const wrap = wrapRef.current;
    const foot = footRef.current;
    if (!wrap || !foot) return;

    const h = wrap.offsetHeight;
    const visible = Math.max(0, Math.min(h, window.innerHeight - wrap.getBoundingClientRect().top));
    const k = h ? visible / h : 1;
    if (k === lastK.current) return;
    lastK.current = k;
    foot.style.transform = `translate3d(0,${-(1 - k) * h * 0.55}px,0) scale(${0.94 + 0.06 * k})`;
    foot.style.opacity = String(0.25 + 0.75 * k);
  }, motion);

  return (
    <div ref={wrapRef} className="relative overflow-hidden bg-black">
      <footer ref={footRef} className={className}>
        {children}
      </footer>
    </div>
  );
}

const CHAR_STAGGER_MS = 45;

/**
 * Large slogan whose characters slide up while scrolling down into view and
 * drop away again when scrolling back up.
 */
export function FooterSlogan({ text }: { text: string }) {
  const motion = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lastY = useRef<number | null>(null);
  const [shown, setShown] = useState<boolean | null>(null);

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const y = window.scrollY;
    const dy = y - (lastY.current ?? y);
    lastY.current = y;

    const inView = r.top < window.innerHeight * 0.85 && r.bottom > 0;
    let next = shown ?? false;
    if (!inView) next = false;
    else if (dy < -2) next = false;
    else if (dy > 2 || shown === null) next = true;
    if (next !== shown) setShown(next);
  }, motion);

  const on = !motion || shown === true;
  const chars = text.split("");
  // On mobile the last word drops to its own line ("Let wow" / "begin.").
  const lastSpace = text.lastIndexOf(" ");

  return (
    <div
      ref={ref}
      aria-label={text}
      className="flex flex-wrap overflow-hidden pb-[0.08em] text-[clamp(60px,12.4cqw,196px)] font-medium leading-[0.95] tracking-[-0.055em] text-snow"
    >
      {chars.map((char, i) => {
        const span = (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "inline-block whitespace-pre transition-[transform,color] duration-[900ms,300ms] ease-spark hover:text-brand",
              i === lastSpace && "max-md:hidden",
            )}
            style={{
              transform: on ? "none" : "translateY(110%)",
              transitionDelay: `${(on ? i : chars.length - 1 - i) * CHAR_STAGGER_MS}ms`,
            }}
          >
            {char}
          </span>
        );
        if (i !== lastSpace) return span;
        // A full-width flex item forces the line break.
        return [span, <span key="break" aria-hidden="true" className="basis-full md:hidden" />];
      })}
    </div>
  );
}
