"use client";

import { useRef, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { PillLink } from "@/components/ui/pill";
import { contactCta, menuNav, primaryNav } from "@/config/site";
import { useFrame } from "@/hooks/use-frame";
import { cn } from "@/lib/utils";
import { MenuList } from "./menu-list";

const SHOW_AFTER_PX = 200;
const DIRECTION_THRESHOLD = 3;

/**
 * Pill navigation pinned to the bottom of the viewport. Appears while the
 * user scrolls up (past the hero) and hides again when they scroll down.
 */
export function FloatingNav() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef<number | null>(null);

  useFrame(() => {
    const y = window.scrollY;
    const dy = y - (lastY.current ?? y);
    lastY.current = y;

    let next = visible;
    if (y < SHOW_AFTER_PX) next = false;
    else if (dy < -DIRECTION_THRESHOLD) next = true;
    else if (dy > DIRECTION_THRESHOLD && !menuOpen) next = false;

    if (next !== visible) {
      setVisible(next);
      if (!next) setMenuOpen(false);
    }
  });

  const divider = <span className="block h-[26px] w-px flex-none bg-white/14" />;

  return (
    <div className="pointer-events-none sticky top-[calc(100vh-clamp(84px,7cqw,104px))] z-40 flex h-0 justify-center">
      <div
        className={cn(
          "relative max-w-[calc(100%-24px)] transition-[transform,opacity] duration-[550ms,400ms] ease-spark",
          visible ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-[160%] opacity-0",
        )}
      >
        {menuOpen && (
          <nav className="absolute bottom-[calc(100%+12px)] left-1/2 grid w-[min(560px,calc(100cqw-24px))] -translate-x-1/2 grid-cols-2 gap-x-6 rounded-[28px] border border-white/14 bg-[rgba(22,22,26,0.86)] px-[clamp(20px,2cqw,32px)] py-[clamp(16px,1.6cqw,24px)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-[20px] backdrop-saturate-[1.4]">
            <MenuList items={menuNav} size="md" onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}

        <div className="glass flex h-[clamp(58px,4.6cqw,66px)] items-center gap-[clamp(10px,1.4cqw,20px)] whitespace-nowrap rounded-full border border-white/14 bg-[rgba(28,28,32,0.72)] pl-[clamp(18px,1.8cqw,26px)] pr-[9px] shadow-[0_18px_50px_-18px_rgba(0,0,0,0.6)]">
          <a href="#top" className="flex flex-none items-center">
            <BrandLogo className="h-[clamp(18px,1.5cqw,22px)]" />
          </a>
          <div className="hidden items-center gap-[clamp(10px,1.4cqw,20px)] md:flex">
            {divider}
            <nav className="flex gap-[clamp(16px,1.8cqw,28px)] text-sm font-medium">
              {primaryNav.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-fog-200 transition-colors hover:text-white"
                >
                  {i === 0 && <span className="block size-1.5 rounded-full bg-brand" />}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          {divider}
          <PillLink href={contactCta.href}>{contactCta.label}</PillLink>
          <MenuToggle open={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="bg-white/6" />
        </div>
      </div>
    </div>
  );
}
