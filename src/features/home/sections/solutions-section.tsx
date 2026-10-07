import { PillLink } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";
import type { HomeSolutionsSection } from "@/types/home";
import { SolutionsScene } from "../components/solutions-scene";

export function SolutionsSection({
  title,
  highlight,
  cta,
  items: solutions,
}: HomeSolutionsSection) {
  return (
    <SolutionsScene
      solutions={solutions}
      heading={
        <>
          <Reveal
            as="h2"
            className="m-0 max-w-[16ch] text-[clamp(34px,4cqw,60px)] font-medium leading-none tracking-[-0.04em]"
          >
            {title}
          </Reveal>
          <Reveal delay={120} className="flex min-w-[200px] flex-col gap-1.5">
            <div className="text-[clamp(32px,3.2cqw,48px)] font-medium leading-none tracking-[-0.04em] text-brand-bright">
              {highlight.value}
            </div>
            <div className="text-base text-fog-300">
              {highlight.label}
            </div>
          </Reveal>
        </>
      }
      footer={
        <div className="mt-[clamp(24px,3cqw,40px)] flex justify-center">
          <PillLink href={cta.href} variant="brand">
            {cta.label} <span>→</span>
          </PillLink>
        </div>
      }
    />
  );
}
