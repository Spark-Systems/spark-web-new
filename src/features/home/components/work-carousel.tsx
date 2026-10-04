"use client";

import { useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp } from "@/lib/motion/math";

/** Vertical scroll (px) spent per 1px of horizontal travel. Higher = slower track. */
const SCROLL_RATIO = 2.2;
/** Pinned pause after the last card, in viewport heights, before the page scrolls on. */
const END_HOLD = 0.45;
/** How quickly the track catches up with scroll (higher = snappier). */
const FOLLOW_RATE = 5;

/** Gentle start and stop: slow at both ends of the track, steady in the middle. */
const easeInOutSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

interface WorkCarouselProps {
  title: string;
  count: number;
  children: ReactNode;
}

/**
 * Pinned horizontal track: vertical scrolling moves the project cards
 * sideways. It overlaps the intro scene above so the track slides in over
 * the full-screen image. The track eases in and out, glides behind the
 * scroll, and holds briefly at the end before the page continues down.
 */
export function WorkCarousel({ title, count, children }: WorkCarouselProps) {
  const motion = useMotion();
  const { vh } = useViewport();
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState(Math.round(vh * 3));
  const [trim, setTrim] = useState(0);
  const current = useRef<number | null>(null);
  const lastTime = useRef(0);
  const lastCounter = useRef("");

  useFrame((now) => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!wrap || !stage || !track) return;

    const distance = Math.max(0, track.scrollWidth - wrap.clientWidth);
    // Empty space under the track, trimmed so the next section follows closely.
    const last = stage.lastElementChild as HTMLElement | null;
    const nextTrim = last ? Math.max(0, Math.round(stage.offsetHeight - (last.offsetTop + last.offsetHeight) - 48)) : 0;
    if (nextTrim !== trim) setTrim(nextTrim);

    const run = Math.max(1, Math.round(distance * SCROLL_RATIO));
    const hold = Math.round(vh * END_HOLD);
    const needed = vh + run + hold + nextTrim;
    if (Math.abs(needed - height) > 2) setHeight(needed);

    const target = easeInOutSine(clamp(-wrap.getBoundingClientRect().top / run));

    const dt = Math.min(0.05, Math.max(0, (now - (lastTime.current || now)) / 1000));
    lastTime.current = now;
    const prev = current.current;
    const k = prev === null || !motion ? target : prev + (target - prev) * (1 - Math.exp(-dt * FOLLOW_RATE));
    if (prev !== null && Math.abs(k - prev) < 1e-5) return;
    current.current = k;

    track.style.transform = `translate3d(${(-distance * k).toFixed(2)}px,0,0)`;
    const counter = String(Math.min(count - 1, Math.round(k * (count - 1))) + 1).padStart(2, "0");
    if (counterRef.current && counter !== lastCounter.current) {
      lastCounter.current = counter;
      counterRef.current.textContent = counter;
    }
  });

  return (
    <div
      ref={wrapRef}
      className="relative z-[2]"
      style={{ marginTop: -Math.round(vh * 0.7), height, marginBottom: -trim }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 box-border flex flex-col justify-center gap-[clamp(20px,2.4cqw,36px)] overflow-hidden pb-[clamp(56px,6cqw,96px)] pt-[clamp(80px,7cqw,104px)]"
        style={{ height: vh }}
      >
        <div className="px-gutter flex items-baseline justify-between gap-6">
          <span className="text-[clamp(20px,2cqw,30px)] font-medium tracking-[-0.03em] text-fog-250">{title}</span>
          <span className="font-mono text-[clamp(14px,1.2cqw,18px)] text-fog-600">
            <span ref={counterRef} className="text-brand-bright">
              01
            </span>{" "}
            / {String(count).padStart(2, "0")}
          </span>
        </div>
        <div
          ref={trackRef}
          className="px-gutter flex w-max gap-[clamp(20px,3.4cqw,56px)] will-change-transform [--work-card-w:max(280px,min(52cqw,880px,calc((100vh-380px)*1.6)))]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
