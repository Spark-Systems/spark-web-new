"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { Icon } from "@/components/ui/icon";
import type { ImageAsset } from "@/types/content";

export interface LightboxItem {
  image: ImageAsset;
  caption: string;
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index of the open image, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
}

const EASE = "cubic-bezier(.22,1,.36,1)";
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen image viewer. Tall screenshots scroll inside it; arrows (or the
 * ← → keys) step through the set and Escape or a click on the backdrop closes
 * it. Page scrolling is frozen while it is open.
 */
export function Lightbox({ items, index, onChange }: LightboxProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const n = items.length;
  const go = (d: number) => index !== null && onChange((((index + d) % n) + n) % n);

  // Freeze the page and fade the viewer in while open.
  useLayoutEffect(() => {
    if (!open) return;
    if (controller) controller.lock();
    else document.documentElement.style.overflow = "hidden";
    if (motion) rootRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: EASE });
    return () => {
      if (controller) controller.unlock();
      else document.documentElement.style.overflow = "";
    };
  }, [open, controller, motion]);

  // Each image starts at its top and rises in.
  useLayoutEffect(() => {
    if (index === null) return;
    scrollRef.current?.scrollTo(0, 0);
    if (motion)
      imgWrapRef.current?.animate(
        [{ opacity: 0, transform: "translate3d(0,40px,0) scale(.97)" }, { opacity: 1, transform: "none" }],
        { duration: 700, easing: EASE },
      );
  }, [index, motion]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (index === null) return null;
  const item = items[index];
  const button =
    "flex size-12 items-center justify-center rounded-full border border-white/30 text-snow transition-colors hover:border-brand hover:bg-brand";

  return createPortal(
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={item.caption} className="fixed inset-0 z-[70] bg-[#050505]/97 text-snow">
      <div
        ref={scrollRef}
        data-lenis-prevent=""
        onClick={(e) => e.target === e.currentTarget && onChange(null)}
        className="px-gutter absolute inset-0 flex items-start justify-center overflow-y-auto overscroll-contain pb-16 pt-24"
      >
        <div ref={imgWrapRef} className="w-full max-w-[1280px]">
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={1280}
            height={800}
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="block h-auto w-full rounded-[14px] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[76px] items-center justify-between gap-4 bg-linear-to-b from-[#050505]/92 to-transparent px-[clamp(20px,4cqw,64px)]">
        <span className="flex min-w-0 items-center gap-3.5 text-[15px] text-fog-400">
          <span className="font-mono text-[13px] text-brand-bright">
            {pad2(index + 1)} / {pad2(n)}
          </span>
          {item.caption}
        </span>
        <div className="pointer-events-auto flex gap-2.5">
          <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={button}>
            <Icon name="arrow-left" size={20} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next image" className={button}>
            <Icon name="arrow-right" size={20} />
          </button>
          <button type="button" onClick={() => onChange(null)} aria-label="Close" className={button} autoFocus>
            <Icon name="x-close" size={20} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
