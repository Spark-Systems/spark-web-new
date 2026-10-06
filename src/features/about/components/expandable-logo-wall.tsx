"use client";

import { useRef, useState } from "react";
import { LogoCell, swapCell, useLogoSwap } from "@/components/blocks/logo-wall";
import { Reveal } from "@/components/ui/reveal";
import { useViewport } from "@/hooks/use-viewport";
import { cn } from "@/lib/utils";
import type { ClientLogo } from "@/types/content";

/** Rows shown while collapsed. */
const VISIBLE_ROWS = 3;
/** Each cell's second logo is the client this many places further along the list. */
const PAIR_OFFSET = 11;
/** Must match the cell height in <LogoCell />. */
const CELL_HEIGHT = "clamp(96px,8.5cqw,140px)";

/**
 * Flipping logo grid (2 columns on mobile, 4 on desktop) that shows three rows
 * and expands to every logo with "Show all". While expanded the cells stop
 * flipping and settle on their own logo, so each client appears once.
 * The toggle only appears when there are more logos than fit in three rows.
 */
export function ExpandableLogoWall({ logos }: { logos: ClientLogo[] }) {
  const { isMobile } = useViewport();
  const wallRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useLogoSwap(wallRef, !open);

  if (!logos.length) return null;
  const cols = isMobile ? 2 : 4;
  const rows = Math.max(VISIBLE_ROWS, Math.ceil(logos.length / cols));
  const cells = Array.from({ length: rows * cols }, (_, i) => ({
    a: logos[i],
    b: logos[(i + PAIR_OFFSET) % logos.length],
  }));
  const expandable = rows > VISIBLE_ROWS;

  const toggle = () => {
    // Settle every flipped cell back on its own logo before showing them all.
    if (!open) wallRef.current?.querySelectorAll<HTMLElement>('[data-logo-cell][data-on="b"]').forEach(swapCell);
    setOpen((v) => !v);
  };

  return (
    <div className="min-w-0">
      <Reveal>
        <div
          className="overflow-hidden transition-[height] duration-[1100ms] ease-[cubic-bezier(.65,0,.25,1)]"
          style={{ height: `calc(${open ? rows : VISIBLE_ROWS} * ${CELL_HEIGHT})` }}
        >
          <div ref={wallRef} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {cells.map(({ a, b }, i) => (
              <LogoCell key={`${cols}-${i}`} a={a} b={b} />
            ))}
          </div>
        </div>
      </Reveal>

      {expandable && (
        <div className="mt-[clamp(28px,3cqw,48px)] flex justify-end">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="flex h-[46px] items-center gap-2.5 rounded-full border border-brand px-[22px] text-sm font-medium text-snow transition-colors hover:bg-brand hover:text-white"
          >
            {open ? "Hide" : "Show all"}
            <span className={cn("inline-block transition-transform duration-[400ms] ease-spark", open && "rotate-180")}>
              ↓
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
