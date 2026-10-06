"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { Icon } from "@/components/ui/icon";
import { LiveClock } from "@/components/ui/live-clock";
import { Reveal } from "@/components/ui/reveal";
import { useFrame } from "@/hooks/use-frame";
import { useViewport } from "@/hooks/use-viewport";
import { clamp } from "@/lib/motion/math";
import { cn } from "@/lib/utils";
import type { ContactLine, ContactPageData, Office } from "@/types/contact";
import type { IconName } from "@/types/content";

type OfficeLocatorProps = ContactPageData["offices"];

/** Extra scroll (in viewport heights) given to each office after the first while pinned. */
const SCROLL_PER_OFFICE = 70;
/** From this width the list and map sit side by side and the section pins. */
const PIN_MIN_WIDTH = 1024;
const EASE = "cubic-bezier(.22,1,.36,1)";

/** Icon for each kind of contact line. */
const lineIcons: Record<ContactLine["type"], IconName> = {
  phone: "phone",
  mobile: "device-mobile",
  email: "envelope",
};

/** Google Maps embed (no API key needed) centred on an address. */
const mapEmbed = (address: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Offices beside a live map. On desktop the section pins and scrolling walks
 * through the offices one by one; on tablet and mobile the list sits above the
 * map, the page scrolls normally and tapping an office selects it. Each office change wipes the map card in from the
 * top and staggers its contact lines in.
 */
export function OfficeLocator({ eyebrow, items }: OfficeLocatorProps) {
  const motion = useMotion();
  const controller = useScrollController();
  const { vw } = useViewport();
  const pinned = vw >= PIN_MIN_WIDTH;
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const shown = useRef(active);
  const n = items.length;

  const span = () => (sectionRef.current?.offsetHeight ?? 0) - innerHeight;

  // While pinned, the active office follows the scroll position.
  useFrame(() => {
    const section = sectionRef.current;
    if (!section || !pinned || span() < 10) return;
    const p = clamp(-section.getBoundingClientRect().top / span(), 0, 0.9999);
    const next = Math.floor(p * n);
    if (next !== active) setActive(next);
  });

  const select = (i: number) => {
    const section = sectionRef.current;
    if (!pinned || !section) return setActive(i);
    // Scroll to the middle of that office's stretch of the pinned section.
    const y = scrollY + section.getBoundingClientRect().top + ((i + 0.5) / n) * span();
    if (controller) controller.glideTo(y);
    else scrollTo(0, y);
  };

  // Animate the map card in whenever the office changes.
  useEffect(() => {
    if (shown.current === active) return;
    shown.current = active;
    const card = cardRef.current;
    if (!card || !motion) return;
    card.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], { duration: 900, easing: EASE });
    card.querySelector("iframe")?.animate([{ transform: "scale(1.15)", opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: 1200,
      easing: EASE,
    });
    card.querySelectorAll("[data-office-line]").forEach((line, i) =>
      line.animate([{ transform: "translate3d(0,24px,0)", opacity: 0 }, { transform: "none", opacity: 1 }], {
        duration: 800,
        delay: 120 + i * 80,
        easing: EASE,
        fill: "backwards",
      }),
    );
  }, [active, motion]);

  const office = items[active];

  return (
    <section
      ref={sectionRef}
      id="offices"
      className="bg-texture relative"
      style={pinned ? { height: `calc(100vh + ${(n - 1) * SCROLL_PER_OFFICE}vh)` } : undefined}
    >
      <div
        className={cn(
          "grid overflow-hidden lg:grid-cols-2",
          pinned && "sticky top-0 h-screen",
        )}
      >
        <div className="px-gutter flex flex-col justify-center gap-[clamp(16px,3.5vh,56px)] pb-[clamp(20px,5vh,80px)] pt-[max(76px,10vh)]">
          <Reveal as="span" className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-bright">
            {eyebrow}
          </Reveal>
          <div className="flex flex-col border-b border-white/10">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 90}>
                <OfficeRow office={item} index={i} active={i === active} onSelect={() => select(i)} />
              </Reveal>
            ))}
          </div>
        </div>

        <div ref={cardRef} className="relative min-h-[560px] overflow-hidden bg-[#151518] lg:min-h-full">
          <iframe
            key={office.id}
            src={mapEmbed(office.address)}
            title={`Map of the ${office.city} office`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 size-full border-0 [filter:grayscale(1)_invert(0.92)_contrast(0.9)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-[#050505]/85 to-transparent" />

          {/* Pulsing pin at the map's centre. */}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 size-0">
            <span className="pin-pulse absolute -left-[22px] -top-[22px] size-11 rounded-full bg-brand/35" />
            <Icon
              name="map-pin"
              weight="fill"
              size={40}
              className="absolute -left-5 -top-[38px] text-[#D2373A] drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
            />
          </div>

          <div className="absolute inset-x-[clamp(16px,2.4cqw,40px)] bottom-[clamp(16px,2.4cqw,40px)] rounded-card border border-white/10 bg-ink/72 p-[clamp(22px,2.4cqw,36px)] backdrop-blur-lg">
            <address className="flex flex-col not-italic">
              {office.lines.map((line, i) => (
                <a
                  key={`${office.id}-${i}`}
                  data-office-line=""
                  href={line.href}
                  className="group flex items-center gap-3.5 border-b border-white/14 py-3.5 text-[15px] text-snow transition-colors first:pt-0 last:border-b-0 last:pb-0 hover:text-brand-bright"
                >
                  <span className="flex size-9 flex-none items-center justify-center rounded-full bg-white/8 text-fog-200 transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon name={lineIcons[line.type]} size={18} />
                  </span>
                  <span className="text-fog-600">{line.label}</span>
                  <span className="ml-auto min-w-0 truncate text-right">{line.value}</span>
                </a>
              ))}
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}

interface OfficeRowProps {
  office: Office;
  index: number;
  active: boolean;
  onSelect: () => void;
}

/** One office in the list: number, city and country, local time, and (when active) a link to Google Maps. */
function OfficeRow({ office, index, active, onSelect }: OfficeRowProps) {
  return (
    <div
      className={cn(
        "group relative grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 border-t border-white/10 py-[clamp(10px,2vh,30px)] transition-[color,padding-left] duration-[400ms,550ms] ease-[cubic-bezier(.22,1,.36,1)] hover:pl-3 hover:text-snow",
        active ? "text-snow" : "text-fog-700",
      )}
    >
      {/* The whole row selects the office; the map link sits above it. */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`Show the ${office.city} office`}
        className="absolute inset-0 cursor-pointer"
      />
      <span className={cn("font-mono text-[13px]", active ? "text-brand-bright" : "text-ink-600")}>{pad2(index + 1)}</span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[clamp(28px,min(4.6cqw,7vh),68px)] font-medium leading-none tracking-[-0.04em]">
          {office.city}
        </span>
        <span className="text-sm text-fog-600">
          {office.country}
          {office.hq && " · HQ"}
        </span>
      </span>
      <span className="flex flex-col items-end justify-between gap-3.5 self-stretch">
        <span className="flex items-center gap-2.5 font-mono text-sm text-fog-500">
          <span className={cn("size-[7px] rounded-full", active ? "bg-brand-bright" : "bg-ink-600")} />
          <LiveClock timeZone={office.timeZone} />
        </span>
        {active && (
          <a
            href={office.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the ${office.city} office in Google Maps`}
            className="relative flex size-10 items-center gap-4 overflow-hidden whitespace-nowrap rounded-full bg-brand pl-2.5 text-sm font-semibold text-white transition-[width,background-color] duration-[450ms,300ms] ease-[cubic-bezier(.22,1,.36,1)] hover:w-[100px] hover:bg-brand-deep hover:text-white"
          >
            <Icon name="map-trifold" size={20} className="flex-none" />
            <span className="flex-none">Go to</span>
          </a>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 -bottom-px h-px origin-left bg-brand transition-transform duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </div>
  );
}
