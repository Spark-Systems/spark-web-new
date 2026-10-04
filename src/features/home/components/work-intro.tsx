"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp, easeInOutCubic, lerp } from "@/lib/motion/math";

const SCENE_LENGTH = 4.4; // in viewport heights
/**
 * Share of the pinned run over which the pill grows and the frame expands.
 * The rest is a hold on the full-screen image (as it dims) before the work
 * track slides in over it.
 */
const EXPAND_SHARE = 0.7;
/** How quickly the animation catches up with scroll (higher = snappier). */
const FOLLOW_RATE = 6;

interface WorkIntroProps {
  before: string;
  after: string;
  image: StaticImageData;
  imageAlt: string;
}

/**
 * "Our ▬ work": the small brand pill between the words stretches into a
 * window, then the window expands to fill the screen with the showcase image.
 */
export function WorkIntro({ before, after, image, imageAlt }: WorkIntroProps) {
  const motion = useMotion();
  const { vh } = useViewport();
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cache = useRef({ pillW: -1, frameKey: "" });
  const smooth = useRef({ progress: -1, lastTime: 0 });

  useFrame((now) => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const pill = pillRef.current;
    const frame = frameRef.current;
    if (!scene || !stage || !pill || !frame) return;

    const stageRect = stage.getBoundingClientRect();
    const run = scene.offsetHeight - stage.offsetHeight;
    // Scroll position through the pinned run (0–1), eased so the animation glides behind the scroll.
    const target = clamp(-scene.getBoundingClientRect().top / run);
    const s = smooth.current;
    const dt = Math.min(0.05, Math.max(0, (now - (s.lastTime || now)) / 1000));
    s.lastTime = now;
    const t =
      s.progress < 0 || !motion ? target : s.progress + (target - s.progress) * (1 - Math.exp(-dt * FOLLOW_RATE));
    s.progress = t;

    const p = clamp(t / EXPAND_SHARE);
    const grow = easeInOutCubic(Math.min(1, p / 0.5)); // pill stretches
    const expand = easeInOutCubic(Math.max(0, (p - 0.5) / 0.5)); // frame fills the stage

    const fs = parseFloat(getComputedStyle(pill.parentElement!).fontSize) || 160;
    const pillW = 0.14 * fs + (Math.min(stageRect.width * 0.62, 5 * fs) - 0.14 * fs) * grow;
    const pillH = 0.14 * fs + 0.6 * fs * grow;
    if (pillW !== cache.current.pillW) {
      cache.current.pillW = pillW;
      pill.style.width = `${pillW}px`;
      pill.style.height = `${pillH}px`;
      pill.style.borderRadius = `${grow < 0.3 ? pillH / 2 : 0.22 * fs}px`;
    }

    // The image dims once it fills the screen.
    if (dimRef.current) dimRef.current.style.opacity = String(clamp((t - EXPAND_SHARE) * 1.6, 0, 0.55));

    const pr = pill.getBoundingClientRect();
    const key = `${expand}:${pr.left}:${pr.top}:${stageRect.width}`;
    if (key === cache.current.frameKey) return;
    cache.current.frameKey = key;

    const r0 = parseFloat(pill.style.borderRadius) || pr.height / 2;
    frame.style.left = `${lerp(pr.left - stageRect.left, 0, expand)}px`;
    frame.style.top = `${lerp(pr.top - stageRect.top, 0, expand)}px`;
    frame.style.width = `${lerp(pr.width, stageRect.width, expand)}px`;
    frame.style.height = `${lerp(pr.height, stageRect.height, expand)}px`;
    frame.style.borderRadius = `${lerp(r0, 0, expand)}px`;

    const wordOpacity = String(Math.max(0, 1 - expand * 1.6));
    wordRefs.current.forEach((w) => w && (w.style.opacity = wordOpacity));
  });

  return (
    <div ref={sceneRef} className="relative" style={{ height: Math.round(vh * SCENE_LENGTH) }}>
      <div
        ref={stageRef}
        className="sticky top-0 flex items-center justify-center overflow-hidden"
        style={{ height: vh }}
      >
        <h2
          aria-label={`${before} ${after}`}
          className="px-gutter relative m-0 flex flex-nowrap items-center justify-center gap-x-[0.16em] whitespace-nowrap text-[clamp(64px,12.5cqw,210px)] font-medium leading-[0.92] tracking-[-0.055em] text-fog-250"
        >
          <span ref={(el) => void (wordRefs.current[0] = el)}>{before}</span>
          <span
            ref={pillRef}
            className="invisible block size-[0.14em] flex-none translate-y-[0.04em] overflow-hidden rounded-[0.22em] bg-brand"
          />
          <span ref={(el) => void (wordRefs.current[1] = el)}>{after}</span>
        </h2>

        <div ref={frameRef} className="absolute left-0 top-0 z-[1] size-0 overflow-hidden bg-brand">
          <Image src={image} alt={imageAlt} fill sizes="100vw" placeholder="blur" className="object-cover" />
          <div ref={dimRef} className="absolute inset-0 bg-ink opacity-0" />
        </div>
      </div>
    </div>
  );
}
