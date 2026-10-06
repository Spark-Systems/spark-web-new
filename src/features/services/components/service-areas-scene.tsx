"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/blocks/section-heading";
import { useMotion } from "@/components/providers/motion-provider";
import { Icon } from "@/components/ui/icon";
import { PillLink } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";
import { useFrame } from "@/hooks/use-frame";
import { useScrollStepper } from "@/hooks/use-scroll-stepper";
import { useViewport } from "@/hooks/use-viewport";
import { clamp, easeInOutCubic, lerp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import { serviceHref } from "@/lib/links";
import type { ServiceArea, ServicesPageData } from "@/types/services";

type ServiceAreasSceneProps = ServicesPageData["areas"];

/** Scroll length of the pinned scene, in viewport heights. */
const SCENE_HEIGHT = "760vh";
/** Glide durations (s): the long intro move into the stack, then each service step. */
const INTRO_SECONDS = 3.2;
const STEP_SECONDS = 0.75;

/**
 * Timeline of the scene as shares of its pinned scroll (0–1). The intro runs
 * up to `services[0]`; the services are then evenly spaced up to `services[1]`.
 */
const T = {
  labelsOut: 0.06,
  headOut: [0.04, 0.16],
  gather: 0.11,
  gatherStagger: 0.012,
  darkIn: [0.1, 0.26],
  toFocus: [0.17, 0.26],
  stacked: 0.26,
  uiIn: [0.24, 0.3],
  services: [0.29, 0.96],
} as const;

const ez = (t: number) => easeInOutCubic(clamp(t));
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * "Our services". On desktop a pinned, stepped scene: six image tiles sit in
 * a row on a light page; the first step gathers them into one stack that
 * flies to a focal card while a dark panel rises over the page. Each further
 * step reveals the next service's card on the stack, highlights it in the list
 * on the left and crossfades its details on the right. On mobile the services
 * simply stack.
 */
export function ServiceAreasScene(props: ServiceAreasSceneProps) {
  const { isMobile } = useViewport();
  return isMobile ? <ServiceAreasStacked {...props} /> : <ServiceAreasPinned {...props} />;
}

function ServiceAreasPinned({ eyebrow, title, items }: ServiceAreasSceneProps) {
  const motion = useMotion();
  const n = items.length;
  const sectionRef = useRef<HTMLElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const last = useRef({ p: -1, w: 0, h: 0, stacked: false });
  const [listActive, setListActive] = useState(0);
  const [detailActive, setDetailActive] = useState(0);

  /** Scroll share at which step `k` sits: 0 is the row of tiles, 1…n the services. */
  const stepAt = (k: number) =>
    k === 0 ? 0 : T.services[0] + ((k - 1) / Math.max(1, n - 1)) * (T.services[1] - T.services[0]) + 0.002;
  const range = () => (sectionRef.current?.offsetHeight ?? 0) - innerHeight;

  const stepper = useScrollStepper({
    last: n,
    toScrollY: (k) => {
      const section = sectionRef.current;
      return section ? scrollY + section.getBoundingClientRect().top + stepAt(k) * range() : null;
    },
    secondsFor: (from, to) => (Math.min(from, to) === 0 ? INTRO_SECONDS : STEP_SECONDS),
  });

  useFrame((now) => {
    const section = sectionRef.current;
    const dark = darkRef.current;
    const head = headRef.current;
    const list = listRef.current;
    const detail = detailRef.current;
    if (!section || !dark || !head || !list || !detail) return;

    const W = section.offsetWidth;
    const H = innerHeight;
    const p = clamp(-section.getBoundingClientRect().top / Math.max(1, range()));

    // Raw position in steps (piecewise between the step positions; past the last step it runs on freely).
    let raw = p / stepAt(1);
    for (let k = 1; k < n; k++) if (p > stepAt(k)) raw = k + (p - stepAt(k)) / (stepAt(k + 1) - stepAt(k));
    if (p > stepAt(n)) raw = n + (p - stepAt(n)) / Math.max(1e-3, 1 - stepAt(n));
    stepper.update(raw, now);

    const l = last.current;
    if (p === l.p && W === l.w && H === l.h) return;
    l.p = p;
    l.w = W;
    l.h = H;

    // Geometry: the row of tiles, and the focal card they gather into.
    const pad = clamp(W * 0.055, 20, 88);
    const gap = 16;
    const tileW = (W - 2 * pad - (n - 1) * gap) / n;
    const tileH = Math.min(tileW * 1.3, H * 0.4);
    const rowY = Math.max(H * 0.42, H * 0.62 - tileH / 2);
    const focalW = Math.min(W * 0.26, 440);
    const focalH = Math.min(focalW * 1.05, H * 0.62);
    const focalX = pad + W * 0.25;
    const focalY = H / 2 - focalH / 2;

    const toFocus = ez((p - T.toFocus[0]) / (T.toFocus[1] - T.toFocus[0]));
    const stacked = p >= T.stacked;
    // Progress through the services (0…n-1); cards and details advance a step at a time.
    const s = clamp((p - T.services[0]) / (T.services[1] - T.services[0])) * (n - 1);
    const si = Math.min(n - 2, Math.floor(s));
    const se = s >= n - 1 ? n - 1 : si + ez((s - si - 0.25) / 0.5);
    const fade = stacked && motion && l.stacked ? "opacity 1.1s cubic-bezier(.45,0,.2,1)" : "none";
    l.stacked = stacked;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      let x = focalX;
      let y = focalY;
      let w = focalW;
      let h = focalH;
      if (!stacked) {
        const gather = ez((p - i * T.gatherStagger) / T.gather);
        x = lerp(lerp(pad + i * (tileW + gap), pad, gather), focalX, toFocus);
        y = lerp(rowY, focalY, toFocus);
        w = lerp(tileW, focalW, toFocus);
        h = lerp(tileH, focalH, toFocus);
      }
      card.style.zIndex = String(stacked ? i : n - i);
      card.style.left = `${x.toFixed(1)}px`;
      card.style.top = `${y.toFixed(1)}px`;
      card.style.width = `${Math.max(0, w).toFixed(1)}px`;
      card.style.height = `${h.toFixed(1)}px`;
      card.style.transition = fade;
      card.style.opacity = !stacked || i === 0 || s >= i - 0.5 ? "1" : "0";
    });

    const labelsOut = ez(p / T.labelsOut);
    labelRefs.current.forEach((label, i) => {
      if (!label) return;
      label.style.left = `${pad + i * (tileW + gap)}px`;
      label.style.top = `${rowY + tileH + 14}px`;
      label.style.opacity = (1 - labelsOut).toFixed(3);
      label.style.transform = `translate3d(0,${(labelsOut * 16).toFixed(1)}px,0)`;
    });

    dark.style.transform = `translate3d(0,${((1 - ez((p - T.darkIn[0]) / (T.darkIn[1] - T.darkIn[0]))) * 100).toFixed(2)}%,0)`;
    const headOut = ez((p - T.headOut[0]) / (T.headOut[1] - T.headOut[0]));
    head.style.opacity = (1 - headOut).toFixed(3);
    head.style.transform = `translate3d(0,${(-headOut * 60).toFixed(1)}px,0)`;

    const ui = clamp((p - T.uiIn[0]) / (T.uiIn[1] - T.uiIn[0])).toFixed(3);
    list.style.opacity = ui;
    list.style.left = `${pad}px`;
    detail.style.opacity = ui;
    const detailX = focalX + focalW + W * 0.05;
    detail.style.left = `${detailX}px`;
    detail.style.top = `${focalY}px`;
    detail.style.width = `${W - pad - detailX}px`;

    const nextList = Math.round(se);
    if (nextList !== listActive) setListActive(nextList);
    const nextDetail = stacked ? Math.min(n - 1, Math.floor(s + 0.5)) : 0;
    if (nextDetail !== detailActive) setDetailActive(nextDetail);
  });

  return (
    <section ref={sectionRef} className="relative bg-paper" style={{ height: SCENE_HEIGHT }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-paper">
        <div ref={darkRef} aria-hidden="true" className="bg-texture absolute inset-0 will-change-transform" style={{ transform: "translate3d(0,100%,0)" }} />

        <div ref={headRef} className="px-gutter absolute inset-x-0 top-[clamp(96px,14vh,150px)] text-ink will-change-[transform,opacity]">
          <SectionHeading eyebrow={eyebrow} title={title} size="xl" tone="light" maxWidth="14ch" />
        </div>

        {items.map((item, i) => (
          <div
            key={item.slug}
            ref={(el) => void (cardRefs.current[i] = el)}
            className="absolute left-0 top-0 size-0 overflow-hidden rounded-card bg-surface"
          >
            <Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 1200px) 440px, 30vw" className="object-cover" />
          </div>
        ))}

        {items.map((item, i) => (
          <div
            key={item.slug}
            ref={(el) => void (labelRefs.current[i] = el)}
            aria-hidden="true"
            className="absolute left-0 top-0 flex items-baseline gap-2.5 text-ink will-change-[transform,opacity]"
          >
            <span className="font-mono text-xs text-ink-500">{pad2(i + 1)}</span>
            <span className="text-[clamp(16px,1.4cqw,22px)] font-medium tracking-[-0.02em]">{item.name}</span>
          </div>
        ))}

        <div ref={listRef} className="absolute top-1/2 flex w-[20%] -translate-y-1/2 flex-col" style={{ opacity: 0 }}>
          <span className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-bright">{eyebrow}</span>
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => stepper.goTo(i + 1)}
              aria-current={i === listActive}
              className={cn(
                "flex items-center gap-3.5 border-t border-snow/12 py-3.5 text-left text-[clamp(16px,1.3cqw,19px)] font-medium tracking-[-0.01em] transition-[color,translate] duration-500 ease-spark",
                i === listActive ? "translate-x-2 text-snow" : "text-ink-500 hover:text-fog-300",
              )}
            >
              <span
                className={cn(
                  "size-2 flex-none rounded-full bg-brand transition-transform duration-[400ms] ease-spark",
                  i === listActive ? "scale-100" : "scale-0",
                )}
              />
              <span className="font-mono text-xs text-ink-500">{pad2(i + 1)}</span>
              <span
                className={cn(
                  "inline-block leading-[1.1] tracking-[-0.02em] transition-[font-size] duration-500 ease-spark",
                  i === listActive && "text-[clamp(28px,2.6cqw,44px)]",
                )}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>

        <div ref={detailRef} className="absolute left-0 top-0" style={{ opacity: 0 }}>
          {items.map((item, i) => (
            <div
              key={item.slug}
              aria-hidden={i !== detailActive}
              className={cn(
                "absolute inset-x-0 top-0 transition-opacity duration-[1100ms] ease-[cubic-bezier(.45,0,.2,1)]",
                i === detailActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <ServiceDetails item={item} index={i} total={n} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A service's details: number, icon, pitch, description, capabilities and a link. */
function ServiceDetails({ item, index, total }: { item: ServiceArea; index: number; total: number }) {
  return (
    <div className="flex flex-col gap-[clamp(14px,2.2vh,22px)] pt-[clamp(18px,2.6vh,28px)] text-snow">
      <span className="font-mono text-[13px] text-fog-600">
        {pad2(index + 1)} / {pad2(total)}
      </span>
      <span className="flex size-[52px] flex-none items-center justify-center rounded-full bg-brand text-2xl text-white">
        <Icon name={item.icon} />
      </span>
      <p className="m-0 max-w-[34ch] text-[clamp(17px,1.4cqw,21px)] leading-[1.45] text-fog-100">{item.summary}</p>
      <p className="m-0 max-w-[46ch] text-[15px] leading-relaxed text-fog-400">{item.description}</p>
      <div className="flex flex-wrap gap-2">
        {item.capabilities.map((c) => (
          <span key={c} className="flex h-8 items-center rounded-full bg-snow/8 px-3.5 text-[13px] text-fog-100">
            {c}
          </span>
        ))}
      </div>
      <PillLink href={serviceHref(item)} className="self-start">
        Explore more <span>→</span>
      </PillLink>
    </div>
  );
}

function ServiceAreasStacked({ eyebrow, title, items }: ServiceAreasSceneProps) {
  return (
    <section className="bg-texture px-gutter py-[clamp(64px,12vw,96px)]">
      <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="14ch" className="mb-12" />
      <div className="flex flex-col gap-14">
        {items.map((item, i) => (
          <Reveal key={item.slug} className="flex flex-col gap-5">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-card bg-surface">
              <Image src={item.image.src} alt={item.image.alt} fill sizes="100vw" className="object-cover" />
            </div>
            <h3 className="m-0 text-[clamp(28px,8vw,40px)] font-medium tracking-[-0.03em]">{item.name}</h3>
            <ServiceDetails item={item} index={i} total={items.length} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
