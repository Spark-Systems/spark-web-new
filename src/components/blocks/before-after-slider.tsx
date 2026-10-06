"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { clamp } from "@/lib/motion/math";
import type { ImageAsset } from "@/types/content";

/** Keyboard step (%) for the arrow keys. */
const KEY_STEP = 5;

interface BeforeAfterSliderProps {
  before: ImageAsset;
  after: ImageAsset;
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * Two images stacked with a draggable divider: "before" on the left of the
 * handle, "after" on the right. Drag (mouse or touch) or use the arrow keys.
 */
export function BeforeAfterSlider({ before, after, beforeLabel = "Before", afterLabel = "After" }: BeforeAfterSliderProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [split, setSplit] = useState(50);

  const moveTo = (clientX: number) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (r) setSplit(clamp(((clientX - r.left) / r.width) * 100, 0, 100));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    moveTo(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => dragging.current && moveTo(e.clientX);
  const onPointerUp = () => void (dragging.current = false);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowLeft" ? -KEY_STEP : e.key === "ArrowRight" ? KEY_STEP : 0;
    if (!d) return;
    e.preventDefault();
    setSplit((v) => clamp(v + d, 0, 100));
  };

  const badge = "pointer-events-none absolute top-5 z-2 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em]";

  return (
    <div ref={frameRef} className="relative aspect-video max-h-[82vh] w-full overflow-hidden rounded-card bg-[#E7E5E1]">
      <Image src={before.src} alt={before.alt} fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split.toFixed(2)}%)` }}>
        <Image src={after.src} alt={after.alt} fill sizes="100vw" className="object-cover" />
      </div>
      <span className={`${badge} left-5 bg-ink/72 text-snow`}>{beforeLabel}</span>
      <span className={`${badge} right-5 bg-brand text-white`}>{afterLabel}</span>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 z-3 -ml-7 flex w-14 cursor-ew-resize touch-none items-center justify-center outline-none focus-visible:[&>span:last-child]:ring-2 focus-visible:[&>span:last-child]:ring-brand"
        style={{ left: `${split.toFixed(2)}%` }}
      >
        <span className="pointer-events-none absolute inset-y-0 left-[27px] w-0.5 bg-white" />
        <span className="pointer-events-none relative flex size-[52px] items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <Icon name="arrows-left-right" size={22} />
        </span>
      </div>
    </div>
  );
}
