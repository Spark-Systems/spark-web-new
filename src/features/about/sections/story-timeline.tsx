import { SectionHeading } from "@/components/blocks/section-heading";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { AboutPageData } from "@/types/about";

/**
 * "Our story": milestones on a horizontal line, each an icon disc, year and
 * title. The track scrolls sideways when it doesn't fit the screen.
 */
export function StoryTimeline({ eyebrow, title, milestones }: AboutPageData["story"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(72px,8cqw,128px)]">
      <SectionHeading eyebrow={eyebrow} title={title} className="mb-[clamp(40px,4.5cqw,72px)]" />

      <div className="no-scrollbar bleed-gutter px-gutter overflow-x-auto">
        <ol
          className="m-0 grid w-full min-w-max list-none p-0"
          style={{ gridTemplateColumns: `repeat(${milestones.length}, minmax(128px, 1fr))` }}
        >
          {milestones.map((m, i) => (
            <Reveal as="li" key={`${m.year}-${m.title}`} delay={i * 90} className="relative flex flex-col gap-3.5 pr-4">
              <div className="relative flex h-14 items-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-white/14" />
                <span className="relative flex size-14 flex-none items-center justify-center rounded-full border border-white/18 bg-ink text-2xl text-snow transition-colors duration-300 hover:border-brand hover:bg-brand">
                  <Icon name={m.icon} />
                </span>
              </div>
              <span className="self-start font-mono text-[13px] text-brand-bright">{m.year}</span>
              <span className="max-w-[14ch] text-balance text-[clamp(16px,1.3cqw,19px)] font-medium leading-[1.25] tracking-[-0.015em] text-snow">
                {m.title}
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
