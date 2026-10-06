"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { PillLink } from "@/components/ui/pill";
import { SmartLink } from "@/components/ui/smart-link";
import { contactCta, primaryNav } from "@/config/site";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";
import { SiteMenu, type SiteMenuContent } from "./site-menu";

/** Always show the header within this distance (px) of the top of the page. */
const ALWAYS_SHOW_ABOVE = 120;
/** Scroll distance (px) after which the header gets its solid, blurred background. */
const SOLID_AFTER = 8;
/** Minimum scroll movement (px per frame) that counts as a direction change. */
const DIRECTION_THRESHOLD = 3;
/** Sections marked with this attribute keep the header hidden while they sit under it. */
const HIDE_HEADER_SELECTOR = "[data-hide-header]";

/**
 * Sticky site header, overlaid on the page.
 * - Transparent at the very top (over the hero), solid with blur once scrolled.
 * - Slides away while scrolling down, back in when scrolling up.
 * - Stays hidden while a `[data-hide-header]` section is under it.
 * - The toggle opens the full-screen <SiteMenu />.
 */
export function SiteHeader({ menu }: { menu: SiteMenuContent }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastY = useRef<number | null>(null);
  const hideZones = useRef<HTMLElement[]>([]);

  useEffect(() => {
    hideZones.current = [...document.querySelectorAll<HTMLElement>(HIDE_HEADER_SELECTOR)];
  }, []);

  useFrame(() => {
    const y = window.scrollY;
    const dy = y - (lastY.current ?? y);
    lastY.current = y;

    const nextSolid = y > SOLID_AFTER;
    if (nextSolid !== solid) setSolid(nextSolid);

    const barH = headerRef.current?.offsetHeight ?? 80;
    const inHideZone = hideZones.current.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < barH && r.bottom > barH;
    });

    let next = hidden;
    if (open) next = false;
    else if (inHideZone) next = true;
    else if (y < ALWAYS_SHOW_ABOVE) next = false;
    else if (dy > DIRECTION_THRESHOLD) next = true;
    else if (dy < -DIRECTION_THRESHOLD) next = false;

    if (next !== hidden) setHidden(next);
  });

  const filled = solid || open;
  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <header
      ref={headerRef}
      className={cn(
        // Negative margin = bar height, so the header overlays the hero instead of pushing it down.
        "sticky top-0 z-50 -mb-[clamp(64px,5.6cqw,84px)] border-b transition-[translate,background-color,border-color,backdrop-filter] duration-500 ease-spark motion-reduce:transition-none",
        filled ? "glass border-white/8 bg-ink/86" : "border-transparent bg-transparent",
        hidden && "-translate-y-full",
      )}
    >
      <div className="px-gutter flex h-[clamp(64px,5.6cqw,84px)] items-center gap-[clamp(12px,2.4cqw,40px)]">
        <SmartLink href="/#top" aria-label="Spark Systems home" className="flex flex-none items-center">
          <BrandLogo preload />
        </SmartLink>
        <div className="flex-1" />
        <nav className="hidden gap-9 text-[15px] font-medium text-fog-200 md:flex">
          {primaryNav.map((item) => (
            <SmartLink key={item.href} href={item.href} className="transition-colors hover:text-brand-bright">
              {item.label}
            </SmartLink>
          ))}
        </nav>
        <PillLink href={contactCta.href}>{contactCta.label}</PillLink>
        <MenuToggle ref={toggleRef} open={open} onClick={() => setOpen(true)} />
      </div>

      <SiteMenu content={menu} open={open} onClose={closeMenu} originRef={toggleRef} />
    </header>
  );
}
