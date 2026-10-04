"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Reveal } from "@/components/ui/reveal";
import { seededRandom } from "@/lib/motion/math";
import type { ClientLogo } from "@/types/content";
import { CYCLE_MS, STAGGER_MS, swapCell } from "./logo-wall";

/**
 * Ring radii, as a share of the stage width (the outermost nearly touches the
 * edges). Rings are 10% apart, just over BUBBLE, so bubbles on neighbouring
 * rings never touch while the rings sway past each other.
 */
const RINGS = [0.16, 0.26, 0.36, 0.46];
/** Bubble diameter, as a share of the stage width. */
const BUBBLE = 0.09;
/** How far (degrees) each ring of logos swings either way. */
const SWAY = [18, 15, 13, 11];
/** Seconds for one swing, per ring; alternate rings swing in opposite directions. */
const SWAY_SECONDS = [6, 8, 10, 12];
/** Clearance (degrees) kept between a bubble and the base of the orbit at the far end of its swing. */
const BASE_CLEARANCE = 4;
/** Upper limit on scatter: share of each logo's slot it may land in (the real value is capped per ring so bubbles never touch). */
const MAX_JITTER = 0.9;
/** Change the seed to reshuffle the positions. */
const LAYOUT_SEED = 7;
/** Each bubble's second logo is the client this many places further along the list. */
const PAIR_OFFSET = 7;

/** Spread `total` logos over the rings in proportion to their size (largest-remainder rounding). */
function ringCounts(total: number) {
  const sum = RINGS.reduce((a, r) => a + r, 0);
  const exact = RINGS.map((r) => (total * r) / sum);
  const counts = exact.map((x) => Math.floor(x));
  const byRemainder = exact.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0]);
  // Hand the leftover logos to the rings with the largest remainders (count them once, up front).
  const missing = total - counts.reduce((a, c) => a + c, 0);
  for (let k = 0; k < missing; k++) counts[byRemainder[k][1]]++;
  return counts;
}

const DEG = 180 / Math.PI;

/**
 * Logo angles (degrees, 0 = right, 90 = straight up) per ring.
 *
 * Each ring gets its own arc: narrow enough that, swung SWAY either way, its
 * bubbles still clear the base. The arc is cut into equal slots and every logo
 * lands at a seeded-random spot inside its slot. The scatter is as large as the
 * ring allows while neighbouring bubbles stay at least a bubble apart.
 */
function ringAngles(total: number) {
  const rnd = seededRandom(LAYOUT_SEED);
  return ringCounts(total).map((n, ring) => {
    const r = RINGS[ring];
    // Half a bubble, as an angle on this ring, plus clearance and the swing.
    const edge = Math.asin(BUBBLE / 2 / r) * DEG + BASE_CLEARANCE + SWAY[ring];
    const slot = (180 - 2 * edge) / n;
    // Closest two neighbours can get is slot × (1 − jitter); keep that ≥ one bubble (plus a little air).
    const minGap = 2 * Math.asin(Math.min(1, (BUBBLE * 1.08) / 2 / r)) * DEG;
    const jitter = n > 1 ? Math.max(0, Math.min(MAX_JITTER, 1 - minGap / slot)) : MAX_JITTER;
    return Array.from({ length: n }, (_, i) => edge + slot * (i + (1 - jitter) / 2 + rnd() * jitter));
  });
}

function BubbleLayer({ layer, client }: { layer: "a" | "b"; client: ClientLogo }) {
  return (
    <div
      data-layer={layer}
      className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter]"
      style={layer === "b" ? { opacity: 0, transform: "translateY(40%)" } : undefined}
    >
      <Image
        src={client.logo}
        alt={client.name}
        sizes="140px"
        className="block h-auto max-h-[58%] w-auto max-w-[78%] opacity-90 grayscale transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}

/**
 * Client logos in round bubbles on concentric half-circle orbits rising from
 * the Spark mark. Logos sit at scattered spots on their rings, and each ring
 * slowly sways around the centre (alternate rings in opposite directions)
 * while the bubbles stay upright. Every bubble flips between two clients on
 * the logo wall's rhythm. Rings fade in from the centre outwards, then the
 * bubbles pop in ring by ring.
 */
export function ClientOrbit({ clients }: { clients: ClientLogo[] }) {
  const motion = useMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  let next = 0;
  const rings = ringAngles(clients.length).map((angles) =>
    angles.map((deg) => {
      const i = next++;
      return { deg, a: clients[i], b: clients[(i + PAIR_OFFSET) % clients.length] };
    }),
  );

  // Flip every bubble to its other logo, bubble by bubble, on a steady cycle.
  useEffect(() => {
    if (!motion) return;
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const interval = setInterval(() => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      stageRef.current?.querySelectorAll<HTMLElement>("[data-logo-cell]").forEach((cell, i) => {
        timeouts.push(setTimeout(() => swapCell(cell), i * STAGGER_MS));
      });
    }, CYCLE_MS);
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, [motion]);

  return (
    <div
      ref={stageRef}
      // A size container, so `cqw` inside means a share of the stage width.
      className="@container relative mx-auto aspect-2/1"
      // Fit the screen: never taller than the space left under the heading.
      style={{ width: "min(100%, 1240px, calc((100vh - 340px) * 2))" }}
    >
      {/* Orbits, outermost first so inner ones paint on top. */}
      {[...RINGS].reverse().map((r, k) => {
        const ring = RINGS.length - 1 - k;
        return (
          <Reveal
            key={r}
            delay={ring * 140}
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 rounded-t-full border border-b-0 border-brand/35"
            style={{
              width: `${r * 200}%`,
              height: `${r * 200}%`,
              marginLeft: `${-r * 100}%`,
              background: `rgba(185,56,58,${(0.035 * (RINGS.length - ring)).toFixed(3)})`,
            }}
          />
        );
      })}

      {/* Glow and Spark mark at the centre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[30%] w-[30%] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_50%_100%,rgba(207,74,76,0.45),transparent_70%)]"
      />
      <Reveal delay={200} className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
        <BrandLogo className="h-[clamp(20px,2.6cqw,34px)]" />
      </Reveal>

      {rings.map((logos, ring) => {
        const r = RINGS[ring];
        const sway = {
          "--sway": `${SWAY[ring]}deg`,
          "--sway-duration": `${SWAY_SECONDS[ring]}s`,
          "--sway-direction": ring % 2 ? "alternate-reverse" : "alternate",
          "--sway-counter": ring % 2 ? "alternate" : "alternate-reverse",
          // Start each ring part-way through its swing so the rings move out of step.
          "--sway-delay": `${(-SWAY_SECONDS[ring] * ((ring * 0.37) % 1)).toFixed(2)}s`,
        } as CSSProperties;

        return (
          // A square centred on the orbit's centre: rotating it swings the logos along their ring.
          <div
            key={ring}
            className="orbit-sway pointer-events-none absolute left-1/2 -translate-x-1/2 translate-y-1/2"
            style={{ ...sway, bottom: 0, width: `${r * 200}%`, aspectRatio: "1" }}
          >
            {logos.map(({ deg, a, b }, i) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <div
                  key={a.name}
                  className="orbit-sway-counter pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + 50 * Math.cos(rad)}%`, top: `${50 - 50 * Math.sin(rad)}%` }}
                >
                  <Reveal delay={500 + ring * 160 + i * 70}>
                    <div
                      data-logo-cell=""
                      className="group relative overflow-hidden rounded-full border border-white/12 bg-surface shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] transition-[border-color,scale] duration-300 ease-spark hover:scale-108 hover:border-brand"
                      style={{ width: `${BUBBLE * 100}cqw`, height: `${BUBBLE * 100}cqw` }}
                    >
                      <BubbleLayer layer="a" client={a} />
                      <BubbleLayer layer="b" client={b} />
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
