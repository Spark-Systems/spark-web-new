"use client";

import { useRef } from "react";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp, easeInOutCubic, easeOutCubic, lerp, seededRandom } from "@/lib/motion/math";
import { services, servicesSection } from "@/content/home";
import { ServiceCard } from "../components/service-card";

const SCENE_LENGTH = 6.4; // in viewport heights
const INK = "#0B0B0B";
const WHITE = "#FFFFFF";
/** Horizontal travel (in card widths) over which a card's reveal plays out. */
const REVEAL_DISTANCE = 1.1;
/** Share of the reveal used by the image; the text starts once it is mostly in. */
const MEDIA_SHARE = 0.55;
const CONTENT_START = 0.5;
/** Change the seed to reshuffle the cards' heights within their rows. */
const LAYOUT_SEED = 11;

/** A fixed "random" vertical spot per card within its row's band (0–1). */
const rowOffset = (() => {
  const rnd = seededRandom(LAYOUT_SEED);
  return services.map(() => rnd());
})();
/** Scroll progress over which the "Services" heading fades in (after the circle opens). */
const TITLE_FADE = [0.1, 0.25] as const;

/** Set a style only when it changed, to avoid needless style recalcs. */
function setStyle(el: HTMLElement, prop: "opacity" | "transform", value: string) {
  if (el.style[prop] !== value) el.style[prop] = value;
}

/**
 * A white circle grows from the centre of a dark stage until it fills the
 * screen, then a huge "Services" title and the service cards drift across it
 * as the user keeps scrolling. The heading fades in from transparent once the
 * circle has opened. The equally sized cards are spread evenly along the
 * heading, from its first letter to its last, alternating between a top and a
 * bottom row at seeded heights; as each slides in from the right, its image
 * fades in first, then its text rises in.
 */
export function ServicesSection() {
  const { vh, vw, isMobile } = useViewport();
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const layers = useRef(new Map<HTMLElement, { media: HTMLElement | null; content: HTMLElement | null }>());

  const cardW = Math.round(isMobile ? Math.min(vw * 0.78, vh * 0.64) : Math.min(vw * 0.32, vh * 0.68));
  // Each card keeps its image's native aspect ratio.
  const height = (i: number) => (cardW * services[i].image.height) / services[i].image.width;
  /** Even cards sit in the top band, odd cards in the bottom band, at a random height within it. */
  const top = (i: number) => {
    const [from, to] = i % 2 ? [vh * 0.55, vh * 0.97 - height(i)] : [vh * 0.03, vh * 0.45 - height(i)];
    return Math.round(lerp(from, Math.max(from, to), rowOffset[i]));
  };

  useFrame(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const layer = layerRef.current;
    const title = titleRef.current;
    if (!scene || !stage || !layer || !title) return;

    const travel = scene.offsetHeight - window.innerHeight;
    const p = travel > 0 ? clamp(-scene.getBoundingClientRect().top / travel) : 0;
    const open = easeInOutCubic(clamp(p / 0.2));
    const W = stage.offsetWidth;

    const maxRadius = Math.hypot(W, stage.offsetHeight) / 2 + 4;
    layer.style.clipPath = `circle(${(6 + (maxRadius - 6) * open).toFixed(1)}px at 50% 50%)`;
    stage.style.background = open > 0.995 ? WHITE : INK;

    const q = clamp((p - 0.03) / 0.97);
    const titleW = title.scrollWidth;
    const tx = lerp(W * 0.24, W - titleW - W * 0.04, q);
    title.style.transform = `translate3d(${tx.toFixed(1)}px,-50%,0)`;
    const titleIn = easeOutCubic(clamp((p - TITLE_FADE[0]) / (TITLE_FADE[1] - TITLE_FADE[0])));
    setStyle(title, "opacity", String(+titleIn.toFixed(3)));

    // Cards span the heading: the first starts at its left edge, the last ends at its right edge.
    const cards = cardRefs.current;
    const stride = cards.length > 1 ? (titleW - cardW) / (cards.length - 1) : 0;

    // Cards already on screen when the circle opens wait for it to finish.
    const gate = clamp((open - 0.6) / 0.4);

    cards.forEach((card, i) => {
      if (!card) return;
      const cw = card.offsetWidth;
      const x = tx + i * stride;
      card.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;

      let parts = layers.current.get(card);
      if (!parts) {
        parts = {
          media: card.querySelector<HTMLElement>("[data-card-media]"),
          content: card.querySelector<HTMLElement>("[data-card-content]"),
        };
        layers.current.set(card, parts);
      }

      // 0 as the card's left edge reaches the right of the screen → 1 once it is well inside.
      const enter = Math.min(clamp((W - x) / (cw * REVEAL_DISTANCE)), gate);
      const media = easeOutCubic(clamp(enter / MEDIA_SHARE));
      const content = easeOutCubic(clamp((enter - CONTENT_START) / (1 - CONTENT_START)));

      if (parts.media) {
        setStyle(parts.media, "opacity", String(+media.toFixed(3)));
        setStyle(parts.media, "transform", media > 0.999 ? "none" : `scale(${(1.08 - 0.08 * media).toFixed(4)})`);
      }
      if (parts.content) {
        setStyle(parts.content, "opacity", String(+content.toFixed(3)));
        setStyle(parts.content, "transform", content > 0.999 ? "none" : `translate3d(0,${((1 - content) * 24).toFixed(1)}px,0)`);
      }
    });
  });

  return (
    <section id="services" data-hide-header="">
      <div ref={sceneRef} className="relative" style={{ height: Math.round(vh * SCENE_LENGTH) }}>
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
                transform: "translate3d(30vw,-50%,0)",
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
                style={{
                  top: top(i),
                  width: cardW,
                  transform: "translate3d(120vw,0,0)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
