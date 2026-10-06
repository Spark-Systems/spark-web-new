"use client";

import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { clamp } from "@/lib/motion/math";
import type { ImageAsset } from "@/types/content";
import { ParallaxImage } from "./parallax-image";

/** Side inset (%) and corner radius (px) the image starts from. */
const INSET = 12;
const RADIUS = 20;

/**
 * A wide image that opens out as it scrolls into view: it starts as a rounded
 * card inset from the sides and widens to the full width with square
 * corners, while the photo drifts slowly inside.
 */
export function ClipRevealImage({ image, className }: { image: ImageAsset; className?: string }) {
  const motion = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lastP = useRef(-1);

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const vh = innerHeight;
    // 0 as its top enters the bottom of the screen → 1 once it has risen 85% of the screen.
    const p = clamp((vh - el.getBoundingClientRect().top) / (vh * 0.85));
    if (p === lastP.current) return;
    lastP.current = p;
    const e = 1 - (1 - p) * (1 - p);
    const x = ((1 - e) * INSET).toFixed(2);
    el.style.clipPath = `inset(0 ${x}% 0 ${x}% round ${((1 - e) * RADIUS).toFixed(1)}px)`;
  }, motion);

  return (
    <div
      ref={ref}
      className={className ?? "relative h-[min(92vh,900px)] overflow-hidden"}
      style={{ clipPath: motion ? `inset(0 ${INSET}% 0 ${INSET}% round ${RADIUS}px)` : undefined }}
    >
      <ParallaxImage image={image} strength={80} />
    </div>
  );
}
