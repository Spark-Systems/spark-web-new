"use client";

import { useRef, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { PillLink } from "@/components/ui/pill";
import { contactCta, menuNav, primaryNav } from "@/config/site";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";
import { MenuList } from "./menu-list";

/** Always show the header within this distance (px) of the top of the page. */
const ALWAYS_SHOW_ABOVE = 120;
/** Minimum scroll movement (px per frame) that counts as a direction change. */
const DIRECTION_THRESHOLD = 3;

/**
 * Sticky site header that slides out of view while scrolling down and back in
 * as soon as the user scrolls up. It stays visible near the top of the page
 * and while the menu is open.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef<number | null>(null);

  useFrame(() => {
    const y = window.scrollY;
    const dy = y - (lastY.current ?? y);
    lastY.current = y;

    let next = hidden;
    if (y < ALWAYS_SHOW_ABOVE || open) next = false;
    else if (dy > DIRECTION_THRESHOLD) next = true;
    else if (dy < -DIRECTION_THRESHOLD) next = false;

    if (next !== hidden) setHidden(next);
  });

  return (
    <header
      className={cn(
        "glass sticky top-0 z-50 border-b border-white/8 bg-ink/86 transition-transform duration-500 ease-spark motion-reduce:transition-none",
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
        <nav className="px-gutter absolute inset-x-0 top-full grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-1 border-b border-white/8 bg-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] pb-[clamp(36px,5cqw,72px)] pt-[clamp(28px,4cqw,56px)]">
          <MenuList items={menuNav} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </header>
  );
}
