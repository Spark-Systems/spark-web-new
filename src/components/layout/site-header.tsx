"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { PillLink } from "@/components/ui/pill";
import { contactCta, menuNav, primaryNav } from "@/config/site";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";
import { MenuList } from "./menu-list";

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
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
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
        <a href="#top" className="flex flex-none items-center">
          <BrandLogo preload />
        </a>
        <div className="flex-1" />
        <nav className="hidden gap-9 text-[15px] font-medium text-fog-200 md:flex">
          {primaryNav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-brand-bright">
              {item.label}
            </a>
          ))}
        </nav>
        <PillLink href={contactCta.href}>{contactCta.label}</PillLink>
        <MenuToggle open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      {/* Overlays the page so opening it never changes the document height. */}
      {open && (
        <nav className="px-gutter absolute inset-x-0 top-full grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-1 border-b border-white/8 bg-ink pb-[clamp(36px,5cqw,72px)] pt-[clamp(28px,4cqw,56px)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
          <MenuList items={menuNav} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </header>
  );
}
