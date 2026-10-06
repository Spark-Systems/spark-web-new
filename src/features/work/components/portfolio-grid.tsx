"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/blocks/section-heading";
import { useMotion } from "@/components/providers/motion-provider";
import { cn } from "@/lib/utils";
import type { WorkPageData } from "@/types/work";
import { ProjectCard } from "./project-card";

/**
 * "Selected work": filter pills (built from the projects' categories) over a
 * grid of project cards. Switching filters re-deals the cards, each rising in
 * a beat after the last.
 */
export function PortfolioGrid({ eyebrow, title, allLabel, items }: WorkPageData["portfolio"]) {
  const motion = useMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState(allLabel);
  const changed = useRef(false);

  const filters = [allLabel, ...Array.from(new Set(items.map((p) => p.category)))];
  const shown = filter === allLabel ? items : items.filter((p) => p.category === filter);

  useLayoutEffect(() => {
    if (!changed.current || !motion) return;
    gridRef.current?.querySelectorAll<HTMLElement>("[data-project]").forEach((card, i) =>
      card.animate([{ opacity: 0, transform: "translate3d(0,90px,0)" }, { opacity: 1, transform: "none" }], {
        duration: 900,
        delay: i * 120,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "backwards",
      }),
    );
  }, [filter, motion]);

  const choose = (next: string) => {
    changed.current = true;
    setFilter(next);
  };

  return (
    <>
      <div className="mb-[clamp(40px,5cqw,64px)] flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="12ch" />
        <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {filters.map((label) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={label === filter}
              onClick={() => choose(label)}
              className={cn(
                "h-10 rounded-full border px-[18px] text-sm transition-colors duration-300",
                label === filter ? "border-snow bg-snow text-ink" : "border-white/22 text-snow hover:border-white/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={gridRef}
        className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] gap-x-[clamp(16px,2cqw,28px)] gap-y-[clamp(28px,3cqw,48px)]"
      >
        {shown.map((project) => (
          <div key={project.slug} data-project="">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </>
  );
}
