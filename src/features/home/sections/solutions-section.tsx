import { PillLink } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";
import { Tbc } from "@/components/ui/typography";
import { solutions, solutionsSection } from "@/content/home";
import { SolutionsScene } from "../components/solutions-scene";

export function SolutionsSection() {
  const { title, highlight, cta } = solutionsSection;

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
              {highlight.label}{" "}
              <Tbc className="font-mono text-xs text-fog-600">{highlight.tbc}</Tbc>
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
