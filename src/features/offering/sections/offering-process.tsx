import { ProgressSteps } from "@/components/blocks/progress-steps";
import { SectionHeading } from "@/components/blocks/section-heading";
import type { OfferingDetail } from "@/types/offering";

/** "How it works": the steps along a line that fills in red as you scroll. */
export function OfferingProcess({ eyebrow, title, steps }: OfferingDetail["process"]) {
  return (
    <section className="bg-paper px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        size="xl"
        tone="light"
        maxWidth="14ch"
        className="mb-[clamp(48px,6cqw,88px)]"
      />
      <ProgressSteps steps={steps} />
    </section>
  );
}
