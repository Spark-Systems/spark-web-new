"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useMotion } from "@/components/providers/motion-provider";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SmartLink } from "@/components/ui/smart-link";
import { menuSecondaryNav } from "@/config/site";
import { cn } from "@/lib/utils";
import type { MenuItem, NavLink } from "@/types/content";

const EASE_IN_OUT = "cubic-bezier(.76,0,.24,1)";
const EASE_OUT = "cubic-bezier(.22,1,.36,1)";
const EASE_IN = "cubic-bezier(.64,0,.78,0)";

type Circle = { x: number; y: number; r: number };
const clip = ({ x, y }: Circle, r: number) => `circle(${r}px at ${x}px ${y}px)`;

/** A circle centred on `el` (or the top-right corner) that covers the whole viewport. */
function circleFrom(el: HTMLElement | null): Circle {
  const b = el?.getBoundingClientRect();
  const x = b?.width ? b.left + b.width / 2 : innerWidth - 40;
  const y = b?.width ? b.top + b.height / 2 : 38;
  return { x, y, r: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2 };
}

const all = (root: HTMLElement, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];

/** Play the opening sequence: red wipe, then the panel, then links rising out of their masks. */
function animateOpen(panel: HTMLElement, red: HTMLElement, c: Circle) {
  red.animate([{ clipPath: clip(c, 0) }, { clipPath: clip(c, c.r) }], {
    duration: 720,
    easing: EASE_IN_OUT,
    fill: "forwards",
  });
  panel.animate([{ clipPath: clip(c, 0) }, { clipPath: clip(c, c.r) }], {
    duration: 720,
    delay: 150,
    easing: EASE_IN_OUT,
    fill: "backwards",
  });
  all(panel, "[data-menu-text]").forEach((el, i) =>
    el.animate([{ transform: "translate3d(0,115%,0) rotate(5deg)" }, { transform: "none" }], {
      duration: 950,
      delay: 560 + i * 70,
      easing: EASE_OUT,
      fill: "backwards",
    }),
  );
  all(panel, "[data-menu-num]").forEach((el, i) =>
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 700 + i * 70, fill: "backwards" }),
  );
  all(panel, "[data-menu-line]").forEach((el, i) =>
    el.animate([{ transform: "scaleX(0)" }, { transform: "none" }], {
      duration: 1100,
      delay: 520 + i * 70,
      easing: EASE_OUT,
      fill: "backwards",
    }),
  );
  all(panel, "[data-menu-row]").forEach((el, i) =>
    el.animate([{ transform: "translate3d(0,24px,0)", opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: 750,
      delay: 680 + i * 50,
      easing: EASE_OUT,
      fill: "backwards",
    }),
  );
}

/** Play the closing sequence (the reverse) and resolve once the red wipe has shrunk away. */
function animateClose(panel: HTMLElement, red: HTMLElement, c: Circle) {
  [...all(panel, "[data-menu-text]")].reverse().forEach((el, i) =>
    el.animate([{ transform: "none" }, { transform: "translate3d(0,-110%,0)" }], {
      duration: 380,
      delay: i * 35,
      easing: EASE_IN,
      fill: "forwards",
    }),
  );
  all(panel, "[data-menu-num], [data-menu-line]").forEach((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }),
  );
  all(panel, "[data-menu-row]").forEach((el, i) =>
    el.animate([{ transform: "none", opacity: 1 }, { transform: "translate3d(0,-16px,0)", opacity: 0 }], {
      duration: 320,
      delay: i * 25,
      easing: EASE_IN,
      fill: "forwards",
    }),
  );
  panel.animate([{ clipPath: clip(c, c.r) }, { clipPath: clip(c, 0) }], {
    duration: 640,
    delay: 300,
    easing: EASE_IN_OUT,
    fill: "forwards",
  });
  return red.animate([{ clipPath: clip(c, c.r) }, { clipPath: clip(c, 0) }], {
    duration: 640,
    delay: 430,
    easing: EASE_IN_OUT,
    fill: "forwards",
  }).finished;
}

/** What the menu shows: its entries and the contact details in the bottom bar. */
export interface SiteMenuContent {
  items: MenuItem[];
  /** Office cities, in order. */
  cities: string[];
  email: string;
  phone: NavLink;
}

interface SiteMenuProps {
  content: SiteMenuContent;
  open: boolean;
  onClose: () => void;
  /** The toggle button: the wipe grows from (and shrinks back into) it, and focus returns to it. */
  originRef: RefObject<HTMLElement | null>;
}

/**
 * Full-screen menu. Opening, a red circle wipes out from the toggle with the
 * dark panel following it; the numbered links then rise out of their masks
 * while their underlines draw in. Closing plays it in reverse. Hovering a link
 * swaps the preview image and brief on the right. Page scroll is frozen while
 * it is open; Escape closes it.
 */
export function SiteMenu({ content, open, onClose, originRef }: SiteMenuProps) {
  const { items: menuNav, email, phone } = content;
  /** Office cities for the bottom bar ("Cairo · Giza · Dubai · Riyadh"). */
  const officeNames = content.cities.join(" · ");
  const motion = useMotion();
  const controller = useScrollController();
  const panelRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const circle = useRef<Circle | null>(null);
  // Bumped on every open/close so a stale close animation never unmounts a reopened menu.
  const run = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);

  if (open && !mounted) {
    setMounted(true);
    setActive(0);
  }

  // Layout effects so scroll is unlocked before a clicked hash link's own handler runs.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const red = redRef.current;
    if (!mounted || !panel || !red) return;
    const id = ++run.current;
    const stopAll = () => [panel, red].forEach((el) => el.getAnimations({ subtree: true }).forEach((a) => a.cancel()));

    if (open) {
      if (controller) controller.lock();
      else document.documentElement.style.overflow = "hidden";
      stopAll();
      circle.current = circleFrom(originRef.current);
      if (motion) animateOpen(panel, red, circle.current);
      closeRef.current?.focus({ preventScroll: true });
      return;
    }

    if (controller) controller.unlock();
    else document.documentElement.style.overflow = "";
    const finish = () => {
      if (run.current !== id) return;
      setMounted(false);
      originRef.current?.focus({ preventScroll: true });
    };
    if (!motion) return finish();
    stopAll();
    animateClose(panel, red, circle.current ?? circleFrom(originRef.current)).then(finish, () => {});
  }, [open, mounted, motion, controller, originRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        ref={redRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[59] bg-brand"
        style={{ clipPath: motion ? "circle(0px at 100% 0%)" : "none" }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        // Lets the panel scroll natively on short screens while Lenis is stopped.
        data-lenis-prevent=""
        className={cn(
          "px-gutter fixed inset-0 z-[60] flex flex-col overflow-auto bg-[#050505] pb-10 text-snow",
          !open && "pointer-events-none",
        )}
      >
        <div data-menu-row="" className="flex h-[clamp(64px,5.6cqw,84px)] flex-none items-center justify-between">
          <BrandLogo />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="h-11 rounded-full border border-white/18 px-[18px] text-[15px] text-snow transition-colors hover:border-white/50"
          >
            Close
          </button>
        </div>

        <div className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,6cqw,120px)]">
          <nav className="flex flex-col justify-center py-[clamp(12px,3vh,40px)]">
            {menuNav.map((item, i) => (
              <SmartLink
                key={item.label}
                href={item.href}
                onClick={onClose}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="relative flex items-center gap-5 py-[clamp(4px,1vh,10px)] text-[clamp(24px,min(5.4cqw,5.6vh),64px)] font-medium leading-[1.1] tracking-[-0.02em] text-snow transition-[padding-left,color] duration-[550ms,300ms] ease-spark hover:pl-5 hover:text-brand-bright"
              >
                <span data-menu-num="" className="w-6 font-mono text-[13px] tracking-normal text-fog-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mb-[-0.1em] block overflow-hidden pb-[0.1em]">
                  <span data-menu-text="" className="block origin-bottom-left">
                    {item.label}
                  </span>
                </span>
                <span data-menu-line="" className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/8" />
              </SmartLink>
            ))}
            <div data-menu-row="" className="ml-11 flex flex-wrap gap-x-7 gap-y-2 pt-[clamp(14px,2.4vh,24px)]">
              {menuSecondaryNav.map((item) => (
                <SmartLink
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="text-lg font-medium text-snow transition-colors hover:text-brand-bright"
                >
                  {item.label}
                </SmartLink>
              ))}
            </div>
          </nav>

          <div className="flex flex-col gap-[clamp(16px,2.6vh,28px)] pb-[clamp(12px,3vh,40px)]">
            {/* Preview image for the hovered entry. */}
            <div
              data-menu-row=""
              className="relative aspect-16/10 max-h-[48vh] w-full overflow-hidden rounded-[14px] bg-surface"
            >
              {menuNav.map((item, i) => (
                <Image
                  key={item.label}
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 860px) 45vw, 90vw"
                  className={cn(
                    "object-cover transition-[opacity,scale] duration-[600ms,1200ms] ease-[cubic-bezier(.22,1,.36,1)]",
                    i === active ? "scale-100 opacity-100" : "scale-106 opacity-0",
                  )}
                />
              ))}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-[#050505]/55 to-transparent" />
            </div>

            {/* Brief and "Explore" link for the hovered entry. */}
            <div data-menu-row="" className="relative min-h-[clamp(96px,14vh,128px)]">
              {menuNav.map((item, i) => (
                <div
                  key={item.label}
                  aria-hidden={i !== active}
                  className={cn(
                    "absolute inset-x-0 top-0 flex flex-col gap-2.5 transition-[opacity,translate] duration-[450ms,600ms] ease-[cubic-bezier(.22,1,.36,1)]",
                    i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3.5 opacity-0",
                  )}
                >
                  <span className="font-mono text-[13px] text-brand-bright">
                    {String(i + 1).padStart(2, "0")} — {item.label}
                  </span>
                  <p className="m-0 max-w-[520px] text-pretty text-[clamp(18px,min(1.6cqw,2.8vh),24px)] leading-[1.4] text-fog-250">
                    {item.brief}
                  </p>
                  <SmartLink
                    href={item.href}
                    onClick={onClose}
                    tabIndex={i === active ? undefined : -1}
                    className="flex w-max items-center gap-2 text-[15px] font-semibold text-snow transition-colors hover:text-brand-bright"
                  >
                    Explore {item.label} <span>→</span>
                  </SmartLink>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          data-menu-row=""
          className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 text-[15px] text-fog-500"
        >
          <span>{officeNames}</span>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <a href={phone.href} className="text-snow transition-colors hover:text-brand-bright">
              {phone.label}
            </a>
            <a href={`mailto:${email}`} className="text-snow transition-colors hover:text-brand-bright">
              {email}
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
