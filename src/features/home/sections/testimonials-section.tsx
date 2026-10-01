import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { testimonials, testimonialsSection } from "@/content/home";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";
import { TestimonialCard } from "../components/testimonial-card";

const MIN_ITEMS_PER_LOOP = 4;

/** Repeat items so one loop is tall enough, starting at `offset`. */
function buildLoop(items: Testimonial[], offset: number) {
  const loop: Testimonial[] = [];
  for (let i = 0; loop.length < Math.max(MIN_ITEMS_PER_LOOP, items.length); i++) {
    loop.push(items[(i + offset) % items.length]);
  }
  return loop;
}

/**
 * Vertical marquee column. The loop is rendered twice and translated by -50%,
 * so the animation wraps seamlessly. Hovering pauses it.
 */
function MarqueeColumn({ items, duration, reverse }: { items: Testimonial[]; duration: number; reverse?: boolean }) {
  return (
    <div className="min-w-0 overflow-hidden">
      <div
        className={cn(
          "flex animate-marquee-up flex-col gap-5 pb-5 hover:[animation-play-state:paused] motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...items, ...items].map((t, i) => (
          <TestimonialCard key={i} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="px-gutter bg-paper py-[clamp(88px,10cqw,160px)] text-ink">
      <div className="mb-[clamp(40px,5cqw,72px)] flex flex-col items-center gap-4 text-center">
        <Reveal as={Eyebrow}>{testimonialsSection.eyebrow}</Reveal>
        <Reveal
          as="h2"
          delay={80}
          className="m-0 text-[clamp(36px,4.4cqw,68px)] font-medium leading-none tracking-[-0.04em]"
        >
          {testimonialsSection.title}
        </Reveal>
      </div>

      <div className="mask-fade-y relative mx-auto grid h-[clamp(520px,48cqw,720px)] max-w-[1080px] grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-5 overflow-hidden">
        <MarqueeColumn items={buildLoop(testimonials, 0)} duration={32} />
        <MarqueeColumn items={buildLoop(testimonials, 1)} duration={40} reverse />
      </div>
    </section>
  );
}
