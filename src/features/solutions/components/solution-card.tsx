"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { Icon } from "@/components/ui/icon";
import { SmartLink } from "@/components/ui/smart-link";
import { solutionHref } from "@/lib/links";
import type { SolutionSummary } from "@/types/solutions";

/** Max tilt (degrees) and image counter-shift (px) at the card's edges. */
const TILT = 9;
const SHIFT = 14;

type CardEvent = MouseEvent<HTMLAnchorElement>;

/** Pointer position within the card, plus the radius that covers the whole card from there. */
function pointer(e: CardEvent) {
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  return {
    card,
    photo: card.querySelector<HTMLElement>("[data-photo]"),
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    reach: Math.ceil(Math.hypot(r.width, r.height)),
    r,
  };
}

/** Animate the photo layer's circular mask from one radius to another, centred on the pointer. */
function wipe(photo: HTMLElement, x: number, y: number, from: number, to: number, transition: string) {
  photo.style.transition = "none";
  photo.style.clipPath = `circle(${from}px at ${x}px ${y}px)`;
  void photo.offsetWidth; // commit the start before animating
  photo.style.transition = transition;
  photo.style.clipPath = `circle(${to}px at ${x}px ${y}px)`;
}

/**
 * Catalogue card: a full photo with the name in white. On hover the photo
 * wipes away from the pointer to reveal a light card (name turns dark), the
 * card tilts towards the pointer and the arrow turns. Leaving wipes the photo
 * back in from where the pointer left.
 */
export function SolutionCard({ solution, index }: { solution: SolutionSummary; index: number }) {
  const motion = useMotion();

  const onEnter = (e: CardEvent) => {
    const { card, photo, x, y, reach } = pointer(e);
    card.dataset.active = "";
    if (!photo) return;
    if (!motion) photo.style.clipPath = "circle(0px at 50% 50%)";
    else wipe(photo, x, y, reach, 0, "clip-path .7s cubic-bezier(.65,0,.35,1)");
  };

  const onMove = (e: CardEvent) => {
    if (!motion) return;
    const { card, photo, x, y, r } = pointer(e);
    const px = x / r.width - 0.5;
    const py = y / r.height - 0.5;
    card.style.transform = `rotateX(${(-py * TILT).toFixed(2)}deg) rotateY(${(px * TILT).toFixed(2)}deg) translateY(-6px)`;
    const img = photo?.firstElementChild as HTMLElement | null;
    if (img) img.style.transform = `translate3d(${(-px * SHIFT).toFixed(1)}px,${(-py * SHIFT).toFixed(1)}px,0)`;
  };

  const onLeave = (e: CardEvent) => {
    const { card, photo, x, y, reach } = pointer(e);
    delete card.dataset.active;
    card.style.transform = "none";
    if (!photo) return;
    if (!motion) photo.style.clipPath = "circle(150% at 50% 50%)";
    else wipe(photo, x, y, 0, reach, "clip-path .8s cubic-bezier(.2,.8,.2,1)");
  };

  return (
    <SmartLink
      href={solutionHref(solution)}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex h-[clamp(220px,19cqw,280px)] flex-col justify-between overflow-hidden rounded-card border border-ink/8 bg-white p-[clamp(20px,1.8cqw,26px)] text-white transition-[transform,color,box-shadow] duration-500 ease-spark transform-3d will-change-transform data-active:text-ink data-active:shadow-[0_30px_60px_rgba(0,0,0,0.14)]"
    >
      {/* Faint photo on the light card underneath. */}
      <div aria-hidden="true" className="absolute inset-0 opacity-10 grayscale">
        <Image src={solution.image.src} alt="" fill sizes="(min-width: 760px) 33vw, 100vw" className="object-cover" />
      </div>
      {/* Full photo on top, masked away on hover. */}
      <div data-photo="" aria-hidden="true" className="absolute inset-0" style={{ clipPath: "circle(150% at 50% 50%)" }}>
        <div className="absolute -inset-[6%] grayscale-[0.2]">
          <Image src={solution.image.src} alt="" fill sizes="(min-width: 760px) 33vw, 100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.78)_100%)]" />
      </div>

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[13px] opacity-60">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex size-10 items-center justify-center rounded-full bg-brand text-white transition-transform duration-500 ease-spark group-data-active:rotate-45 group-data-active:scale-120">
          <Icon name="arrow-up-right" size={18} />
        </span>
      </div>
      <span className="relative text-balance text-[clamp(24px,2.1cqw,32px)] font-medium leading-[1.05] tracking-[-0.03em]">
        {solution.name}
      </span>
    </SmartLink>
  );
}
