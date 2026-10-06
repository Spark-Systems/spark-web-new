import { SectionHeading } from "@/components/blocks/section-heading";
import { Reveal } from "@/components/ui/reveal";
import type { SolutionsPageData } from "@/types/solutions";
import { SolutionCard } from "../components/solution-card";

/** Light section with every solution as an interactive card, three to a row on desktop. */
export function SolutionsCatalog({ eyebrow, title, items }: SolutionsPageData["catalog"]) {
  return (
    <section className="bg-paper px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        size="xl"
        tone="light"
        maxWidth="16ch"
        className="mb-[clamp(40px,5cqw,72px)]"
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(260px,calc((100%-40px)/3))),1fr))] gap-[clamp(12px,1.4cqw,20px)]">
        {items.map((solution, i) => (
          <Reveal key={solution.slug} delay={(i % 4) * 90} className="perspective-[900px]">
            <SolutionCard solution={solution} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
