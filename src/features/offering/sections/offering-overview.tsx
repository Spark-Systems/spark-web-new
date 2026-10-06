import { ScrollFillText } from "@/components/blocks/scroll-fill-text";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/ui/smart-link";
import { TagPills } from "@/components/ui/tag-pills";
import type { NavLink } from "@/types/content";
import type { OfferingDetail } from "@/types/offering";

type OfferingOverviewProps = OfferingDetail["overview"] & {
  /** The "← All solutions" / "← All services" link back to the listing page. */
  back: NavLink;
};

/** Light intro: back link, name and audience tags beside a statement that fills in on scroll. */
export function OfferingOverview({ name, tags, statement, back }: OfferingOverviewProps) {
  return (
    <section className="bg-paper px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(40px,6cqw,112px)]">
        <Reveal className="flex flex-col gap-5">
          <SmartLink
            href={back.href}
            className="flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.16em] text-brand transition-colors hover:text-brand-deep"
          >
            <Icon name="arrow-left" />
            {back.label}
          </SmartLink>
          <h2 className="m-0 max-w-[10ch] text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {name}
          </h2>
          <TagPills tags={tags} tone="light" />
        </Reveal>
        <ScrollFillText
          text={statement}
          className="m-0 text-[clamp(26px,2.8cqw,44px)] font-medium leading-[1.18] tracking-[-0.025em]"
        />
      </div>
    </section>
  );
}
