"use client";

import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";

/**
 * Full-bleed looping video behind the hero. It stays fixed in the viewport
 * while the hero scrolls past (until the hero's bottom edge reaches it).
 */
export function HeroBackground({ videoSrc }: { videoSrc: string }) {
  const motion = useMotion();
  const layerRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(-1);

  useFrame(() => {
    const layer = layerRef.current;
    const section = layer?.parentElement;
    if (!layer || !section) return;
    const top = section.getBoundingClientRect().top;
    const y = Math.max(0, Math.min(section.offsetHeight - layer.offsetHeight, -top));
    if (y === lastY.current) return;
    lastY.current = y;
    layer.style.transform = `translate3d(0,${y}px,0)`;
  }, motion);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[clamp(500px,100vh,1100px)] overflow-hidden will-change-transform"
    >
      <video
        src={videoSrc}
        autoPlay={motion}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.62)_0%,rgba(11,11,11,0.78)_45%,rgba(11,11,11,0.96)_100%)]" />
    </div>
  );
}
