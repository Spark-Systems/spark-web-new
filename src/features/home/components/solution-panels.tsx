import Image from "next/image";
import { PillLink } from "@/components/ui/pill";
import { MonoLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { Solution, SolutionTheme } from "@/types/content";

const themes: Record<SolutionTheme, { card: string; body: string; cta: "inverse" | "brand" }> = {
  brand: { card: "bg-brand text-white", body: "opacity-85", cta: "inverse" },
  navy: { card: "bg-navy text-snow", body: "text-lavender-300", cta: "brand" },
};

/**
 * Full-height image slide; slides are stacked upwards so the reel moves down.
 * `[data-slide-media]` and `[data-slide-shade]` are animated by the scene.
 */
export function SolutionImageSlide({ solution, index }: { solution: Solution; index: number }) {
  return (
    <div className="absolute inset-x-0 h-full overflow-hidden bg-black" style={{ top: `${-index * 100}%` }}>
      <div data-slide-media="" className="absolute inset-0 will-change-transform">
        <Image
          src={solution.image}
          alt={solution.imageAlt}
          fill
          sizes="(min-width: 760px) 62vw, 100vw"
          placeholder="blur"
          className="object-cover"
        />
      </div>
      <div data-slide-shade="" className="pointer-events-none absolute inset-0 bg-black opacity-0" />
    </div>
  );
}

/**
 * Coloured copy slide; slides are stacked downwards so the reel moves up.
 * `[data-slide-copy]` is animated by the scene.
 */
export function SolutionTextSlide({ solution, index }: { solution: Solution; index: number }) {
  const theme = themes[solution.theme];
  return (
    <div className={cn("absolute inset-x-0 h-full", theme.card)} style={{ top: `${index * 100}%` }}>
      <div
        data-slide-copy=""
        className="flex h-full flex-col gap-3.5 p-[clamp(22px,2.4cqw,36px)] will-change-[opacity,transform]"
      >
        <MonoLabel className="opacity-75">{solution.caption}</MonoLabel>
        <h3 className="mt-auto text-[clamp(34px,3.4cqw,52px)] font-medium leading-[0.98] tracking-[-0.04em]">
          {solution.title}
        </h3>
        <p className={cn("text-[clamp(16px,1.25cqw,19px)] leading-[1.45]", theme.body)}>{solution.description}</p>
        <PillLink href={solution.href} variant={theme.cta} className="mt-1.5 self-start">
          Explore {solution.title} →
        </PillLink>
      </div>
    </div>
  );
}
