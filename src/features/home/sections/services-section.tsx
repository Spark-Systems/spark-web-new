"use client";

import { useRef } from "react";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp, easeInOutCubic, easeOutCubic, lerp } from "@/lib/motion/math";
import { services, servicesSection } from "@/content/home";
import { ServiceCard } from "../components/service-card";

/** Scroll (in viewport heights) over which the white circle opens — and closes again when scrolling back up. */
const OPEN_LENGTH = 1.4;
/** The cards start moving once the circle is this far open (0–1). */
const CARDS_START = 0.5;
/**
 * Scroll (in viewport heights) over which the cards travel, per layout:
 * desktop (horizontal), tablet (two columns) and mobile (one longer column).
 */
const CARDS_LENGTH = 3.6;
const CARDS_LENGTH_TABLET = 3.1;
const CARDS_LENGTH_MOBILE = 4.5;
/** Below this width (tablet and mobile) the cards use the column layout. */
const COMPACT_MAX_WIDTH = 1024;
const INK = "#0B0B0B";
const WHITE = "#FFFFFF";
/** Horizontal travel (in card widths) over which a card's reveal plays out. */
const REVEAL_DISTANCE = 1.1;
/** Share of the reveal used by the image; the text starts once it is mostly in. */
const MEDIA_SHARE = 0.55;
const CONTENT_START = 0.5;
/** Gap (px) from the left edge to the heading and first card at the start of their travel. */
const START_EDGE = 200;
/** Gap (px) from the right edge to the heading's last letter and the last card at the end. */
const END_EDGE = 120;
/** Column layout: where each column's travel starts/ends, as a share of the viewport height. */
const COLUMN_BAND = [0.3, 0.7] as const;
/** Circle-opening progress over which the "Services" heading fades in (it runs past 1 into the card travel). */
const TITLE_FADE = [0.5, 1.25] as const;

/** Set a style only when it changed, to avoid needless style recalcs. */
function setStyle(el: HTMLElement, prop: "opacity" | "transform", value: string) {
  if (el.style[prop] !== value) el.style[prop] = value;
}

/**
 * A white circle grows from the centre of a dark stage until it fills the
 * screen, then a huge "Services" title and the service cards drift across it
 * as the user keeps scrolling. The heading fades in from transparent once the
 * circle has opened. The equally sized cards are spread evenly along the
 * heading, from its first letter to its last, alternating between a top row
 * (tops aligned) and a bottom row (bottoms aligned); as each slides in from
 * the right, its image fades in first, then its text rises in.
 *
 * On tablet the cards instead stack in two columns that scroll vertically in
 * opposite directions: the left one rises, the right one sinks. On mobile they
 * stack in a single rising column.
 */
export function ServicesSection() {
  const { vh, vw, isMobile } = useViewport();
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const layers = useRef(new Map<HTMLElement, { media: HTMLElement | null; content: HTMLElement | null }>());

  const compact = vw < COMPACT_MAX_WIDTH;
  const cardsLength = isMobile ? CARDS_LENGTH_MOBILE : compact ? CARDS_LENGTH_TABLET : CARDS_LENGTH;
  const sceneLength = 1 + OPEN_LENGTH * CARDS_START + cardsLength; // in viewport heights

  const cardW = Math.round(isMobile ? Math.min(vw * 0.78, vh * 0.64) : Math.min(vw * 0.32, vh * 0.68));
  // Each card keeps its image's native aspect ratio.
  const height = (i: number) => (cardW * services[i].image.height) / services[i].image.width;
  /** Even cards share a top edge; odd cards share a bottom edge. */
  const top = (i: number) => Math.round(i % 2 ? vh * 0.97 - height(i) : vh * 0.03);

  // Column layout: one column on mobile; on tablet even cards go left, odd right.
  const colCount = isMobile ? 1 : 2;
  const side = isMobile ? 16 : 32;
  const gap = isMobile ? 12 : 20;
  const colW = Math.floor((vw - 2 * side - (colCount - 1) * gap) / colCount);
  const columns = (() => {
    const offset: number[] = [];
    const colH = [0, 0];
    services.forEach((s, i) => {
      const col = i % colCount;
      offset[i] = colH[col];
      colH[col] += (colW * s.image.height) / s.image.width + gap;
    });
    return { offset, colH: colH.map((h) => Math.max(0, h - gap)) };
  })();

  useFrame(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const layer = layerRef.current;
    const title = titleRef.current;
    if (!scene || !stage || !layer || !title) return;

    const H = stage.offsetHeight;
    const scrolled = Math.max(0, -scene.getBoundingClientRect().top);
    // Circle opening (0–1, may run past 1) and card travel (0–1), each over its own length of scroll.
    const o = scrolled / (OPEN_LENGTH * H);
    const open = easeInOutCubic(clamp(o));
    const q = clamp((scrolled - OPEN_LENGTH * CARDS_START * H) / (cardsLength * H));
    const W = stage.offsetWidth;

    const maxRadius = Math.hypot(W, H) / 2 + 4;
    layer.style.clipPath = `circle(${(6 + (maxRadius - 6) * open).toFixed(1)}px at 50% 50%)`;
    stage.style.background = open > 0.995 ? WHITE : INK;

    const titleW = title.scrollWidth;
    // Starts START_EDGE px from the left; ends with its last letter (and the last card) END_EDGE px from the right.
    const tx = lerp(START_EDGE, W - titleW - END_EDGE, q);
    title.style.transform = `translate3d(${tx.toFixed(1)}px,-50%,0)`;
    const titleIn = easeOutCubic(clamp((o - TITLE_FADE[0]) / (TITLE_FADE[1] - TITLE_FADE[0])));
    setStyle(title, "opacity", String(+titleIn.toFixed(3)));

    // Cards span the heading: the first starts at its left edge, the last ends at its right edge.
    const cards = cardRefs.current;
    const stride = cards.length > 1 ? (titleW - cardW) / (cards.length - 1) : 0;

    // Column layout: the left (or only) column rises while the right one sinks.
    const [bandTop, bandBottom] = [H * COLUMN_BAND[0], H * COLUMN_BAND[1]];
    const colY = [lerp(bandTop, bandBottom - columns.colH[0], q), lerp(bandBottom - columns.colH[1], bandTop, q)];

    // Cards already on screen when the circle opens wait for it to finish.
    const gate = clamp((open - 0.6) / 0.4);

    cards.forEach((card, i) => {
      if (!card) return;
      let enter: number;
      if (compact) {
        const y = colY[i % colCount] + columns.offset[i];
        const ch = card.offsetHeight;
        card.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
        // 0 while the card is off the top or bottom of the screen → 1 once it is well inside.
        const reveal = ch * REVEAL_DISTANCE * 0.6;
        enter = Math.min(clamp((H - y) / reveal), clamp((y + ch) / reveal), gate);
      } else {
        const cw = card.offsetWidth;
        const x = tx + i * stride;
        card.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        // 0 as the card's left edge reaches the right of the screen → 1 once it is well inside.
        enter = Math.min(clamp((W - x) / (cw * REVEAL_DISTANCE)), gate);
      }

      let parts = layers.current.get(card);
      if (!parts) {
        parts = {
          media: card.querySelector<HTMLElement>("[data-card-media]"),
          content: card.querySelector<HTMLElement>("[data-card-content]"),
        };
        layers.current.set(card, parts);
      }

      const media = easeOutCubic(clamp(enter / MEDIA_SHARE));
      const content = easeOutCubic(clamp((enter - CONTENT_START) / (1 - CONTENT_START)));

      if (parts.media) {
        setStyle(parts.media, "opacity", String(+media.toFixed(3)));
        setStyle(parts.media, "transform", media > 0.999 ? "none" : `scale(${(1.08 - 0.08 * media).toFixed(4)})`);
      }
      if (parts.content) {
        setStyle(parts.content, "opacity", String(+content.toFixed(3)));
        setStyle(
          parts.content,
          "transform",
          content > 0.999 ? "none" : `translate3d(0,${((1 - content) * 24).toFixed(1)}px,0)`,
        );
      }
    });
  });

  return (
    <section id="services" data-hide-header="">
      <div
        ref={sceneRef}
        className="relative"
        style={{
          height: Math.round(vh * sceneLength),
        }}
      >
        <div ref={stageRef} className="sticky top-0 overflow-hidden bg-ink" style={{ height: vh }}>
          <div
            ref={layerRef}
            className="absolute inset-0 bg-white will-change-[clip-path] [clip-path:circle(0px_at_50%_50%)]"
          >
            <h2
              ref={titleRef}
              className="absolute left-0 top-1/2 m-0 whitespace-nowrap bg-night-glow bg-clip-text pb-[0.12em] font-medium leading-none tracking-[-0.04em] text-transparent will-change-transform"
              style={{
                fontSize: Math.round(vh * (isMobile ? 0.42 : 0.64)),
                transform: `translate3d(${START_EDGE}px,-50%,0)`,
                opacity: 0,
              }}
            >
              {servicesSection.title}
            </h2>

            {services.map((service, i) => (
              <ServiceCard
                key={service.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                service={service}
                compact={compact && !isMobile}
                style={
                  compact
                    ? {
                        top: 0,
                        left: side + (i % colCount) * (colW + gap),
                        width: colW,
                        transform: "translate3d(0,120vh,0)",
                      }
                    : {
                        top: top(i),
                        width: cardW,
                        transform: "translate3d(120vw,0,0)",
                      }
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
