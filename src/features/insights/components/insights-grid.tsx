"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { InsightsPageData } from "@/types/insights";
import { InsightCard } from "./insight-card";

/** "All posts" on the light background, filterable by category; filtered cards slide in. */
export function InsightsGrid({ eyebrow, title, allLabel, categories, items }: InsightsPageData["posts"]) {
  const [category, setCategory] = useState<string | null>(null);
  const shown = category ? items.filter((p) => p.category === category) : items;
  const tabs = [{ value: null, label: allLabel }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <section className="bg-[#F4F3F1] px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <Reveal className="mb-[clamp(32px,4cqw,56px)] flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="m-0 max-w-[12ch] text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {title}
          </h2>
        </div>
        {categories.length > 1 && (
          <div role="tablist" aria-label={title} className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.value === category;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(tab.value)}
                  className={cn(
                    "h-10 rounded-full border px-[18px] text-sm transition-colors",
                    active ? "border-ink bg-ink text-snow" : "border-ink/22 bg-transparent text-ink hover:border-ink/50",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </Reveal>

      {/* Re-keyed per category so the filtered cards replay their entrance. */}
      <div
        key={category ?? "all"}
        className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-x-[clamp(16px,2cqw,28px)] gap-y-[clamp(28px,3cqw,44px)]"
      >
        {shown.map((post, i) => (
          <div
            key={post.slug}
            className="motion-safe:animate-[insight-in_0.7s_cubic-bezier(.2,.8,.2,1)_backwards]"
            style={{ animationDelay: `${(i % 6) * 60}ms` }}
          >
            <InsightCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
