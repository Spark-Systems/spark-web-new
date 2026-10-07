"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, MonoLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { CareersPageData } from "@/types/careers";

type RolesSectionProps = CareersPageData["roles"] & {
  /** "Apply for this role": fill the form with this role and scroll to it. */
  onApply: (title: string) => void;
};

/** Open positions as an accordion; the first one starts open. */
export function RolesSection({ eyebrow, title, items, onApply }: RolesSectionProps) {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="roles" className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)] text-snow">
      <Reveal className="mb-[clamp(32px,4cqw,56px)] flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-5">
          <Eyebrow className="text-brand-bright">{eyebrow}</Eyebrow>
          <h2 className="m-0 max-w-[12ch] text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {title}
          </h2>
        </div>
        <MonoLabel className="text-[13px] text-fog-500">
          {String(items.length).padStart(2, "0")} {items.length === 1 ? "position" : "positions"}
        </MonoLabel>
      </Reveal>

      {items.length === 0 ? (
        <p className="m-0 border-t border-white/12 pt-8 text-lg text-fog-400">
          No open roles right now. You&apos;re welcome to send an open application below.
        </p>
      ) : (
        <div className="flex flex-col">
          {items.map((role, i) => {
            const isOpen = open === i;
            const panelId = `role-${role.id}`;
            return (
              <Reveal key={role.id} className="border-t border-white/12">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full flex-wrap items-center gap-x-[clamp(20px,3cqw,48px)] gap-y-3 bg-transparent py-[clamp(24px,3cqw,36px)] text-left text-snow transition-colors hover:text-brand-bright"
                >
                  <MonoLabel className="w-7 text-[13px] text-fog-500">{String(i + 1).padStart(2, "0")}</MonoLabel>
                  <span className="flex-[1_1_280px] text-[clamp(24px,2.6cqw,40px)] font-medium tracking-[-0.03em]">{role.title}</span>
                  <span className="flex items-center gap-2 text-sm text-fog-400">
                    <Icon name="map-pin" size={18} weight="light" />
                    {role.location}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-11 flex-none items-center justify-center rounded-full border border-white/20 transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)]",
                      isOpen && "rotate-45",
                    )}
                  >
                    <span className="text-lg leading-none">+</span>
                  </span>
                </button>
                <div
                  id={panelId}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(24px,3cqw,56px)] pb-[clamp(32px,4cqw,56px)] md:pl-[calc(28px+3cqw)]">
                      {role.groups.map((group) => (
                        <div key={group.heading} className="flex flex-col gap-3.5">
                          <Eyebrow className="text-brand-bright">{group.heading}</Eyebrow>
                          {group.items.map((item) => (
                            <span key={item} className="flex gap-3 text-[15px] leading-normal text-fog-200">
                              <span aria-hidden className="mt-[9px] size-1.5 flex-none rounded-full bg-brand" />
                              {item}
                            </span>
                          ))}
                        </div>
                      ))}
                      <div className="col-span-full flex justify-end">
                        <button
                          type="button"
                          onClick={() => onApply(role.title)}
                          className="flex min-h-[42px] items-center gap-2 rounded-full border border-brand bg-transparent px-5 text-sm font-medium text-snow transition-colors hover:bg-brand hover:text-white"
                        >
                          Apply for this role
                          <Icon name="arrow-right" size={16} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
