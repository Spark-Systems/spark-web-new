"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { PillLink } from "@/components/ui/pill";
import { contactCta, menuNav, primaryNav } from "@/config/site";
import { MenuList } from "./menu-list";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass relative z-20 border-b border-white/8 bg-ink/86">
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

      {open && (
        <nav className="px-gutter grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-1 border-t border-white/8 pb-[clamp(36px,5cqw,72px)] pt-[clamp(28px,4cqw,56px)]">
          <MenuList items={menuNav} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </header>
  );
}
