"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useViewport } from "@/hooks/use-viewport";
import type { ClientLogo } from "@/types/content";

/** Time between logo swaps, and the delay between neighbouring cells within a swap. */
const CYCLE_MS = 3200;
const STAGGER_MS = 140;
const EASE = "cubic-bezier(.4,0,.2,1)";

type Layer = "a" | "b";

/**
 * Swap a cell's visible logo layer with the hidden one (slide up + blur).
 * A cell is a `[data-logo-cell]` holding two `[data-layer="a"|"b"]` children; "a" starts visible.
 */
export function swapCell(cell: HTMLElement) {
  const current = (cell.dataset.on as Layer) || "a";
  const next: Layer = current === "a" ? "b" : "a";
  const out = cell.querySelector<HTMLElement>(`[data-layer="${current}"]`);
  const incoming = cell.querySelector<HTMLElement>(`[data-layer="${next}"]`);
  if (!out || !incoming) return;

  incoming.style.transition = "none";
  incoming.style.transform = "translateY(40%)";
  incoming.style.opacity = "0";
  incoming.style.filter = "blur(6px)";
  void incoming.offsetHeight; // commit the start pose before animating

  const transition = `transform .7s ${EASE}, opacity .7s ${EASE}, filter .7s ${EASE}`;
  out.style.transition = incoming.style.transition = transition;
  out.style.transform = "translateY(-40%)";
  out.style.opacity = "0";
  out.style.filter = "blur(6px)";
  incoming.style.transform = "none";
  incoming.style.opacity = "1";
  incoming.style.filter = "none";
  cell.dataset.on = next;
}

/** Flip every `[data-logo-cell]` inside `rootRef` in turn, on a steady cycle, while `enabled`. */
export function useLogoSwap(rootRef: RefObject<HTMLElement | null>, enabled = true) {
  const motion = useMotion();

  useEffect(() => {
    if (!motion || !enabled) return;
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const interval = setInterval(() => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      rootRef.current?.querySelectorAll<HTMLElement>("[data-logo-cell]").forEach((cell, i) => {
        timeouts.push(setTimeout(() => swapCell(cell), i * STAGGER_MS));
      });
    }, CYCLE_MS);
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, [rootRef, motion, enabled]);
}

function LogoLayer({ layer, client }: { layer: Layer; client?: ClientLogo }) {
  return (
    <div
      data-layer={layer}
      className="absolute inset-0 flex items-center justify-center p-3 will-change-[transform,opacity,filter]"
      style={layer === "b" ? { opacity: 0, transform: "translateY(40%)" } : undefined}
    >
      {client && (
        <Image
          src={client.logo}
          alt={client.name}
          className="block h-auto max-h-[50%] w-auto max-w-[62%] opacity-78 brightness-115 grayscale"
        />
      )}
    </div>
  );
}

/** One flipping logo cell: shows `a`, swaps to `b` (see useLogoSwap). An empty `a` leaves a blank slot. */
export function LogoCell({ a, b }: { a?: ClientLogo; b?: ClientLogo }) {
  return (
    <div data-logo-cell="" className="relative h-[clamp(96px,8.5cqw,140px)] overflow-hidden">
      <LogoLayer layer="a" client={a} />
      <LogoLayer layer="b" client={b} />
    </div>
  );
}

/**
 * Grid of client logos where every cell periodically flips to a second
 * logo, staggered left-to-right.
 */
export function LogoWall({ clients }: { clients: ClientLogo[] }) {
  const { isMobile } = useViewport();
  const wallRef = useRef<HTMLDivElement>(null);
  useLogoSwap(wallRef);

  const half = Math.floor(clients.length / 2);
  const cells = isMobile
    ? clients.slice(0, half).map((a, i) => ({ a, b: clients[i + half] }))
    : clients.map((a, i) => ({ a, b: clients[(i + 7) % clients.length] }));

  return (
    <div ref={wallRef} data-reveal="" className="grid grid-cols-2 gap-y-[clamp(8px,1.2cqw,20px)] md:grid-cols-6">
      {cells.map(({ a, b }) => (
        <LogoCell key={`${isMobile}-${a.name}`} a={a} b={b} />
      ))}
    </div>
  );
}
