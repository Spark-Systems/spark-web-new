"use client";

import Image from "next/image";
import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/content";

/** Overscan so the image never shows an edge while it drifts. */
const OVERSCAN = 1.18;

interface ParallaxImageProps {
  image: ImageAsset;
  /** Pixels the image drifts per viewport height of scroll (higher = deeper). */
  strength?: number;
  sizes?: string;
  className?: string;
}

/**
 * An image that fills its (positioned) parent and drifts slower than the
 * page as it scrolls past, for depth. Still under reduced motion.
 */
export function ParallaxImage({ image, strength = 60, sizes = "100vw", className }: ParallaxImageProps) {
  const motion = useMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!frame || !layer) return;
    const r = frame.getBoundingClientRect();
    const vh = innerHeight;
    if (r.bottom < -50 || r.top > vh + 50) return;
    // −0.5…0.5 as the frame's centre crosses the viewport.
    const offset = (r.top + r.height / 2 - vh / 2) / vh;
    layer.style.transform = `translate3d(0,${(-offset * strength).toFixed(1)}px,0) scale(${OVERSCAN})`;
  }, motion);

  return (
    <div ref={frameRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      <div
        ref={layerRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: motion ? `scale(${OVERSCAN})` : undefined }}
      >
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}
