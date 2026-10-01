import Image from "next/image";
import { PillLink } from "@/components/ui/pill";
import { MonoLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { Solution, SolutionTheme } from "@/types/content";

const themes: Record<SolutionTheme, { card: string; body: string; cta: "inverse" | "brand" }> = {
  brand: { card: "bg-brand text-white", body: "opacity-85", cta: "inverse" },
  navy: { card: "bg-navy text-snow", body: "text-lavender-300", cta: "brand" },
};

/** Full-height image slide; slides are stacked upwards so the reel moves down. */
export function SolutionImageSlide({ solution, index }: { solution: Solution; index: number }) {
  return (
    <div className="absolute inset-x-0 h-full overflow-hidden bg-black" style={{ top: `${-index * 100}%` }}>
      <Image
        src={solution.image}
        alt={solution.imageAlt}
        fill
        sizes="(min-width: 760px) 62vw, 100vw"
        placeholder="blur"
        className="object-cover"
      />
    </div>
  );
}

/** Coloured copy slide; slides are stacked downwards so the reel moves up. */
export function SolutionTextSlide({ solution, index }: { solution: Solution; index: number }) {
  const theme = themes[solution.theme];
  return (
    <div
      className={cn(
        "absolute inset-x-0 flex h-full flex-col gap-3.5 p-[clamp(22px,2.4cqw,36px)]",
        theme.card,
      )}
      style={{ top: `${index * 100}%` }}
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
  );
}
